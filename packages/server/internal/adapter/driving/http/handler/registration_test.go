package handler_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"budgero-server/internal/adapter/driving/http/handler"
	"budgero-server/internal/config"
	"budgero-server/internal/testkit"
	"github.com/labstack/echo/v4"
)

func TestRegistrationPolicyEnforcement(t *testing.T) {
	for _, tc := range []struct {
		name      string
		env       bool
		readError bool
	}{
		{name: "persistent setting"}, {name: "environment override", env: true}, {name: "settings read failure", readError: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			_, _, services, cfg := testkit.NewTestServices(t, true)
			cfg.Features.DisableRegistration = tc.env
			policy := config.RegistrationPolicy{DatabasePath: filepath.Join(t.TempDir(), "budget.db")}
			if err := policy.SetDisabled(true); err != nil {
				t.Fatal(err)
			}
			read := policy.Disabled
			if tc.env {
				read = func() (bool, error) { return false, nil }
			}
			if tc.readError {
				read = func() (bool, error) { return false, errors.New("unreadable") }
			}
			h := handler.NewHandlers(services, nil, handler.Options{SelfHost: true, Config: cfg, RegistrationDisabled: read})
			e := echo.New()
			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"username":"new-user","name":"New","password":"password123"}`))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			err := h.SelfHostRegister(e.NewContext(req, rec))
			want := http.StatusForbidden
			if tc.readError {
				want = http.StatusServiceUnavailable
			}
			var httpErr *echo.HTTPError
			if !errors.As(err, &httpErr) || httpErr.Code != want {
				t.Fatalf("register error = %v; want %d", err, want)
			}
			rec = httptest.NewRecorder()
			err = h.SelfHostAuthConfig(e.NewContext(httptest.NewRequest(http.MethodGet, "/", http.NoBody), rec))
			if tc.readError {
				if !errors.As(err, &httpErr) || httpErr.Code != want {
					t.Fatalf("config error = %v", err)
				}
				return
			}
			if err != nil || !strings.Contains(rec.Body.String(), `"registration_enabled":false`) {
				t.Fatalf("config = %s, %v", rec.Body.String(), err)
			}
			if setErr := policy.SetDisabled(false); setErr != nil {
				t.Fatal(setErr)
			}
			rec = httptest.NewRecorder()
			err = h.SelfHostAuthConfig(e.NewContext(httptest.NewRequest(http.MethodGet, "/", http.NoBody), rec))
			expected := `"registration_enabled":true`
			if tc.env {
				expected = `"registration_enabled":false`
			}
			if err != nil || !strings.Contains(rec.Body.String(), expected) {
				t.Fatalf("config after enable = %s, %v", rec.Body.String(), err)
			}
		})
	}
}
