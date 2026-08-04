package email

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Store owns the sent_emails dedup table plus the per-flow candidate
// queries. Uses raw database/sql rather than sqlc so this package stays
// self-contained — if you want to migrate to sqlc later, the queries
// live in one place.
type Store struct {
	db *sql.DB
}

// NewStore constructs the store. Callers are expected to share the single
// *sql.DB used by the rest of the app.
func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

// HasSent reports whether the given (user, template) pair has already been
// recorded in sent_emails. The primary key on the table guarantees at most
// one row per pair, so this is a direct existence check.
func (s *Store) HasSent(ctx context.Context, userID, template string) (bool, error) {
	var one int
	err := s.db.QueryRowContext(ctx,
		`SELECT 1 FROM sent_emails WHERE user_id = ? AND template = ? LIMIT 1`,
		userID, template,
	).Scan(&one)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

// MarkSent records the send. If the row already exists (double-tick race),
// the INSERT OR IGNORE keeps it idempotent rather than erroring.
func (s *Store) MarkSent(ctx context.Context, userID, template string, sentAt time.Time) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT OR IGNORE INTO sent_emails (user_id, template, sent_at) VALUES (?, ?, ?)`,
		userID, template, sentAt.UTC(),
	)
	return err
}

// CountSent returns how many users have a sent_emails row for the given
// template/dedup key. Used to show "already sent this quarter" in the admin UI.
func (s *Store) CountSent(ctx context.Context, template string) (int, error) {
	var n int
	err := s.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM sent_emails WHERE template = ?`, template,
	).Scan(&n)
	return n, err
}

// Candidate is the minimum user info the scheduler needs to fire an email.
type Candidate struct {
	UserID    string
	Email     string
	FirstName string
}

// WelcomeCatchup finds SaaS users created within the last 24h who don't
// yet have a `welcome` row in sent_emails. The inline send at signup is
// the primary path; this backstops sends that failed transiently (Resend
// 500, network blip, process killed mid-flight).
//
// We exclude users whose email is still the synthesized clerk_id@clerk.user
// placeholder (Clerk fetch failed at signup) — those addresses bounce 100%
// of the time. Once the next Clerk sync repairs the email, the catchup
// will pick them up on a subsequent pass.
func (s *Store) WelcomeCatchup(ctx context.Context, now time.Time, lookback time.Duration) ([]Candidate, error) {
	return s.queryCandidates(ctx, `
		SELECT u.id, u.email, u.name
		FROM users u
		WHERE u.created_at >= ?
		  AND u.email NOT LIKE '%@clerk.user'
		  AND NOT EXISTS (
		    SELECT 1 FROM sent_emails s
		    WHERE s.user_id = u.id AND s.template = ?
		  )
	`, now.Add(-lookback).UTC(), TemplateWelcome)
}

// Day2FeedbackCandidates finds users who signed up between 51h and 48h ago
// (3h slack for delayed scheduler ticks) for the personal "what's almost
// stopping you?" ask. Deliberately no activity/subscription filter — the
// question works for both engaged and stalled users.
func (s *Store) Day2FeedbackCandidates(ctx context.Context, now time.Time) ([]Candidate, error) {
	windowStart := now.Add(-51 * time.Hour).UTC()
	windowEnd := now.Add(-48 * time.Hour).UTC()
	return s.queryCandidates(ctx, `
		SELECT u.id, u.email, u.name
		FROM users u
		WHERE u.created_at BETWEEN ? AND ?
		  AND u.email NOT LIKE '%@clerk.user'
		  AND NOT EXISTS (
		    SELECT 1 FROM sent_emails s
		    WHERE s.user_id = u.id AND s.template = ?
		  )
	`, windowStart, windowEnd, TemplateDay2Feedback)
}

// Day33Candidates finds users whose trial_ends_at is between 45h and 48h in
// the future (i.e. the last 3h before the official "2 days left" mark), who
// haven't subscribed and haven't been emailed yet. The 3h window catches
// scheduler ticks running on a 10-minute cadence.
func (s *Store) Day33Candidates(ctx context.Context, now time.Time) ([]Candidate, error) {
	windowStart := now.Add(45 * time.Hour).UTC()
	windowEnd := now.Add(48 * time.Hour).UTC()
	return s.queryCandidates(ctx, `
		SELECT u.id, u.email, u.name
		FROM users u
		WHERE u.trial_ends_at BETWEEN ? AND ?
		  AND u.subscription_status IN ('on_trial', 'trialing')
		  AND u.email NOT LIKE '%@clerk.user'
		  AND NOT EXISTS (
		    SELECT 1 FROM sent_emails s
		    WHERE s.user_id = u.id AND s.template = ?
		  )
	`, windowStart, windowEnd, TemplateTrialEndingDay33)
}

// Day35Candidates finds users whose trial just ended in the last 3h (so we
// fire the "ends today" email on the day-of).
func (s *Store) Day35Candidates(ctx context.Context, now time.Time) ([]Candidate, error) {
	windowStart := now.Add(-3 * time.Hour).UTC()
	windowEnd := now.UTC()
	return s.queryCandidates(ctx, `
		SELECT u.id, u.email, u.name
		FROM users u
		WHERE u.trial_ends_at BETWEEN ? AND ?
		  AND u.subscription_status IN ('on_trial', 'trialing', 'expired', 'inactive')
		  AND u.email NOT LIKE '%@clerk.user'
		  AND NOT EXISTS (
		    SELECT 1 FROM sent_emails s
		    WHERE s.user_id = u.id AND s.template = ?
		  )
	`, windowStart, windowEnd, TemplateTrialEndingDay35)
}

// FeedbackBroadcastCandidates finds users with any activity heartbeat since
// activeSince (user_daily_activity.day is a YYYY-MM-DD string) who haven't
// yet received the broadcast identified by dedupKey.
func (s *Store) FeedbackBroadcastCandidates(ctx context.Context, activeSince time.Time, dedupKey string) ([]Candidate, error) {
	return s.queryCandidates(ctx, `
		SELECT u.id, u.email, u.name
		FROM users u
		WHERE u.email NOT LIKE '%@clerk.user'
		  AND EXISTS (
		    SELECT 1 FROM user_daily_activity a
		    WHERE a.user_id = u.id AND a.day >= ?
		  )
		  AND NOT EXISTS (
		    SELECT 1 FROM sent_emails s
		    WHERE s.user_id = u.id AND s.template = ?
		  )
	`, activeSince.UTC().Format("2006-01-02"), dedupKey)
}

func (s *Store) queryCandidates(ctx context.Context, query string, args ...any) ([]Candidate, error) {
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query candidates: %w", err)
	}
	defer func() { _ = rows.Close() }()

	var out []Candidate
	for rows.Next() {
		var c Candidate
		if err := rows.Scan(&c.UserID, &c.Email, &c.FirstName); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
