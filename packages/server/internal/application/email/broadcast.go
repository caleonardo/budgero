package email

import (
	"context"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
)

// feedbackActiveWindow defines "active user" for the feedback broadcast:
// any heartbeat within the last 30 days.
const feedbackActiveWindow = 30 * 24 * time.Hour

// sendPacing spaces broadcast sends so a burst stays well under Resend's
// rate limit (10 req/s on the default plan).
const sendPacing = 150 * time.Millisecond

// FeedbackBroadcastStatus is the preview shown in the admin UI before sending.
type FeedbackBroadcastStatus struct {
	Quarter     string `json:"quarter"`
	Eligible    int    `json:"eligible"`
	AlreadySent int    `json:"alreadySent"`
	DryRun      bool   `json:"dryRun"`
}

// FeedbackBroadcastResult reports what a broadcast run actually did.
type FeedbackBroadcastResult struct {
	Quarter  string `json:"quarter"`
	Eligible int    `json:"eligible"`
	Sent     int    `json:"sent"`
	Failed   int    `json:"failed"`
	DryRun   bool   `json:"dryRun"`
}

// QuarterKey returns the sent_emails dedup key for the quarter containing t,
// e.g. "quarterly_feedback_2026q3". Keying per quarter makes the send button
// idempotent within a quarter and re-armed the next.
func QuarterKey(t time.Time) string {
	q := (int(t.UTC().Month())-1)/3 + 1
	return fmt.Sprintf("%s_%dq%d", TemplateQuarterlyFeedback, t.UTC().Year(), q)
}

// GetFeedbackBroadcastStatus computes recipient counts for the current
// quarter without sending anything.
func (s *Service) GetFeedbackBroadcastStatus(ctx context.Context, now time.Time) (FeedbackBroadcastStatus, error) {
	key := QuarterKey(now)
	candidates, err := s.store.FeedbackBroadcastCandidates(ctx, now.Add(-feedbackActiveWindow), key)
	if err != nil {
		return FeedbackBroadcastStatus{}, err
	}
	alreadySent, err := s.store.CountSent(ctx, key)
	if err != nil {
		return FeedbackBroadcastStatus{}, err
	}
	return FeedbackBroadcastStatus{
		Quarter:     key,
		Eligible:    len(candidates),
		AlreadySent: alreadySent,
		DryRun:      s.cfg.Email.DryRun,
	}, nil
}

// SendFeedbackBroadcast sends the quarterly feedback email to every user
// active in the last 30 days who hasn't received this quarter's edition.
// Failures are logged and skipped so one bad address can't stall the run;
// because dedup is per-recipient, re-invoking resumes where it left off.
func (s *Service) SendFeedbackBroadcast(ctx context.Context, now time.Time) (FeedbackBroadcastResult, error) {
	key := QuarterKey(now)
	candidates, err := s.store.FeedbackBroadcastCandidates(ctx, now.Add(-feedbackActiveWindow), key)
	if err != nil {
		return FeedbackBroadcastResult{}, err
	}

	result := FeedbackBroadcastResult{Quarter: key, Eligible: len(candidates), DryRun: s.cfg.Email.DryRun}
	for i, c := range candidates {
		if err := ctx.Err(); err != nil {
			return result, err
		}
		if i > 0 {
			time.Sleep(sendPacing)
		}
		if err := s.SendOnceKeyed(ctx, c.UserID, c.Email, c.FirstName, TemplateQuarterlyFeedback, key); err != nil {
			result.Failed++
			log.Error().Err(err).Str("user_id", c.UserID).Str("key", key).
				Msg("email: feedback broadcast send failed")
			continue
		}
		result.Sent++
	}

	log.Info().Str("key", key).Int("eligible", result.Eligible).Int("sent", result.Sent).
		Int("failed", result.Failed).Bool("dry_run", result.DryRun).
		Msg("email: feedback broadcast complete")
	return result, nil
}
