package application

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"

	"budgero-server/internal/port/driving"
)

// RateRefreshInterval is how often the refresher checks whether today's
// rates are cached for recently used currency pairs. The upstream dataset
// publishes once per day; 6h keeps weekends/gaps tight without hammering it.
const RateRefreshInterval = 6 * time.Hour

// RateRefresher keeps the daily exchange-rate cache warm so client balance
// true-ups don't wait on an upstream fetch.
type RateRefresher struct {
	svc driving.ExchangeRateService
}

// NewRateRefresher creates a refresher over the exchange-rate service.
func NewRateRefresher(svc driving.ExchangeRateService) *RateRefresher {
	return &RateRefresher{svc: svc}
}

// Run blocks until ctx is canceled. Safe to call from a goroutine. Ticks
// once immediately so a fresh boot warms the cache right away.
func (r *RateRefresher) Run(ctx context.Context) {
	if r == nil || r.svc == nil {
		return
	}
	log.Info().Dur("interval", RateRefreshInterval).Msg("rate refresher: starting")

	r.tick(ctx)

	ticker := time.NewTicker(RateRefreshInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Info().Msg("rate refresher: shutting down")
			return
		case <-ticker.C:
			r.tick(ctx)
		}
	}
}

func (r *RateRefresher) tick(ctx context.Context) {
	tickCtx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()
	refreshed, err := r.svc.RefreshTodayRates(tickCtx)
	if err != nil {
		log.Warn().Err(err).Msg("rate refresher: tick failed")
		return
	}
	if refreshed > 0 {
		log.Info().Int("pairs", refreshed).Msg("rate refresher: cache warmed")
	}
}
