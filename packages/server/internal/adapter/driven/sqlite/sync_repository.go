package sqlite

import (
	"context"

	"budgero-server/internal/adapter/driven/sqlite/sqlc"
	"budgero-server/internal/domain"
	"budgero-server/internal/port/driven/repository"
)

// SyncRepository implements repository.SyncRepository using SQLite.
type SyncRepository struct {
	queries *sqlc.Queries
}

// NewSyncRepository creates a new SyncRepository.
func NewSyncRepository(queries *sqlc.Queries) *SyncRepository {
	return &SyncRepository{queries: queries}
}

var _ repository.SyncRepository = (*SyncRepository)(nil)

// GetLatestVersion returns the latest mutation version for a space.
func (r *SyncRepository) GetLatestVersion(ctx context.Context, spaceID string) (int64, error) {
	result, err := r.queries.GetLatestMutationVersion(ctx, spaceID)
	if err != nil {
		return 0, err
	}
	return ToInt64(result), nil
}

// ListMutationsBefore returns up to limit entries with version < before, newest first.
func (r *SyncRepository) ListMutationsBefore(ctx context.Context, spaceID string, before int64, limit int) ([]domain.MutationLogEntry, error) {
	rows, err := r.queries.ListMutationsBefore(ctx, sqlc.ListMutationsBeforeParams{
		SpaceID: spaceID,
		Version: before,
		Limit:   int64(limit),
	})
	if err != nil {
		return nil, err
	}
	entries := make([]domain.MutationLogEntry, 0, len(rows))
	for i := range rows {
		row := &rows[i]
		entries = append(entries, domain.MutationLogEntry{
			ID:               row.ID,
			UserID:           row.UserID,
			Version:          row.Version,
			BaseVersion:      row.BaseVersion,
			Timestamp:        row.Timestamp,
			EncryptedPayload: row.EncryptedPayload.String,
			Op:               row.Op.String,
		})
	}
	return entries, nil
}
