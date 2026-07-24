package handler

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

// GetFeedbackBroadcastStatus previews the quarterly feedback broadcast:
// eligible recipient count, how many already got this quarter's edition,
// and whether the email service is in dry-run mode.
func (h *Handlers) GetFeedbackBroadcastStatus(c echo.Context) error {
	if h.email == nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "email service is disabled")
	}
	status, err := h.email.GetFeedbackBroadcastStatus(c.Request().Context(), time.Now().UTC())
	if err != nil {
		log.Error().Err(err).Msg("failed to compute feedback broadcast status")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to compute broadcast status")
	}
	return c.JSON(http.StatusOK, status)
}

// SendFeedbackBroadcast sends the quarterly feedback email to all users
// active in the last 30 days. Dedup is per (user, quarter), so re-invoking
// after a partial failure resumes rather than double-sending.
func (h *Handlers) SendFeedbackBroadcast(c echo.Context) error {
	if h.email == nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "email service is disabled")
	}
	result, err := h.email.SendFeedbackBroadcast(c.Request().Context(), time.Now().UTC())
	if err != nil {
		log.Error().Err(err).Msg("feedback broadcast failed")
		return echo.NewHTTPError(http.StatusInternalServerError, "feedback broadcast failed")
	}
	return c.JSON(http.StatusOK, result)
}
