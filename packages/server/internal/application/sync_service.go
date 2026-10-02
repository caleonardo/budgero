package application

import (
	"context"
	"math"

	"budgero-server/internal/domain"

	"budgero-server/internal/port/driven/repository"
	"budgero-server/internal/port/driving"
)

// SyncService implements driving.SyncService.
type SyncService struct {
	syncRepo repository.SyncRepository
}

// NewSyncService creates a new SyncService.
func NewSyncService(syncRepo repository.SyncRepository) *SyncService {
	return &SyncService{syncRepo: syncRepo}
}

var _ driving.SyncService = (*SyncService)(nil)

// GetLatestVersion returns the latest mutation version for a space.
func (s *SyncService) GetLatestVersion(ctx context.Context, spaceID string) (int64, error) {
	return s.syncRepo.GetLatestVersion(ctx, spaceID)
}

// MaxMutationLogPage caps how many log entries one request may return.
const MaxMutationLogPage = 100

// ListMutationsBefore returns a page of the encrypted mutation log, newest first.
// before <= 0 starts from the head.
func (s *SyncService) ListMutationsBefore(ctx context.Context, spaceID string, before int64, limit int) ([]domain.MutationLogEntry, error) {
	if limit <= 0 || limit > MaxMutationLogPage {
		limit = MaxMutationLogPage
	}
	if before <= 0 {
		before = math.MaxInt64
	}
	return s.syncRepo.ListMutationsBefore(ctx, spaceID, before, limit)
}
