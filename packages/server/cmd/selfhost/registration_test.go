package main

import (
	"bytes"
	"path/filepath"
	"strings"
	"testing"
)

func TestRegistrationCommand(t *testing.T) {
	t.Setenv("SELF_HOSTABLE", "true")
	t.Setenv("DISABLE_REGISTRATION", "false")
	t.Setenv("DB_PATH", filepath.Join(t.TempDir(), "budget.db"))
	for _, tc := range []struct{ action, want string }{
		{"status", "enabled"}, {"disable", "disabled"}, {"status", "disabled"}, {"enable", "enabled"},
	} {
		cmd := newRegistrationCmd()
		var output bytes.Buffer
		cmd.SetOut(&output)
		cmd.SetArgs([]string{tc.action})
		if err := cmd.Execute(); err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(output.String(), "Public registration: "+tc.want) {
			t.Fatalf("output = %s", output.String())
		}
	}
	t.Setenv("DISABLE_REGISTRATION", "true")
	cmd := newRegistrationCmd()
	cmd.SetArgs([]string{"enable"})
	if err := cmd.Execute(); err == nil {
		t.Fatal("expected environment override error")
	}
}
