package config

import (
	"errors"
	"os"
	"path/filepath"
)

// RegistrationPolicy persists the CLI switch beside the instance database.
// Reads are uncached so running servers observe CLI changes immediately.
type RegistrationPolicy struct {
	DatabasePath        string
	EnvironmentDisabled bool
}

func (p RegistrationPolicy) markerPath() string {
	return p.DatabasePath + ".registration-disabled"
}

// Disabled returns the effective policy, including the environment override.
func (p RegistrationPolicy) Disabled() (bool, error) {
	if p.EnvironmentDisabled {
		return true, nil
	}
	_, err := os.Stat(p.markerPath())
	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}
	if err != nil {
		return true, err
	}
	return true, nil
}

// SetDisabled updates the persistent CLI setting without changing the environment.
func (p RegistrationPolicy) SetDisabled(disabled bool) error {
	if !disabled {
		err := os.Remove(p.markerPath())
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return err
	}
	if err := os.MkdirAll(filepath.Dir(p.markerPath()), 0o750); err != nil {
		return err
	}
	return os.WriteFile(p.markerPath(), nil, 0o600)
}
