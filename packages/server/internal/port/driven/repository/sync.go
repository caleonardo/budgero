package repository

import (
	"context"

	"budgero-server/internal/domain"
)

// SyncRepository defines methods for sync/mutation log persistence.
type SyncRepository interface {
	// GetLatestVersion returns the latest mutation version for a space.
	GetLatestVersion(ctx context.Context, spaceID string) (int64, error)
	// ListMutationsBefore returns up to limit entries with version < before, newest first.
	ListMutationsBefore(ctx context.Context, spaceID string, before int64, limit int) ([]domain.MutationLogEntry, error)
}
