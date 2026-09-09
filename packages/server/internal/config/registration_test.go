package config

import (
	"path/filepath"
	"testing"
)

func TestRegistrationPolicy(t *testing.T) {
	policy := RegistrationPolicy{DatabasePath: filepath.Join(t.TempDir(), "instance", "budget.db")}
	check := func(want bool) {
		t.Helper()
		got, err := policy.Disabled()
		if err != nil || got != want {
			t.Fatalf("Disabled() = %v, %v; want %v", got, err, want)
		}
	}
	check(false)
	for _, disabled := range []bool{true, true, false, false} {
		if err := policy.SetDisabled(disabled); err != nil {
			t.Fatal(err)
		}
		check(disabled)
	}
	policy.EnvironmentDisabled = true
	check(true)
	if err := policy.SetDisabled(false); err != nil {
		t.Fatal(err)
	}
	check(true)
}
