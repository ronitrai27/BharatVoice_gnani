// Package server wires everything together: it builds the router and applies
// the middleware.
package server

import (
	"net/http"

	"gnani/server/internal/auth"
	"gnani/server/internal/httpx"
	"gnani/server/internal/middleware"
	"gnani/server/internal/onboarding"
)

type Deps struct {
	Verifier       *auth.Verifier
	Onboarding     *onboarding.Handler
	AllowedOrigins []string
}

// NewRouter lists every route in one place. Go's standard ServeMux understands
// "METHOD /path" patterns, so no third-party router is needed.
func NewRouter(d Deps) http.Handler {
	mux := http.NewServeMux()
	requireAuth := middleware.RequireAuth(d.Verifier)

	// Public routes.
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /v1/onboarding/options", d.Onboarding.Options)

	// Routes that need a signed-in user.
	mux.Handle("GET /v1/onboarding", requireAuth(http.HandlerFunc(d.Onboarding.Get)))
	mux.Handle("POST /v1/onboarding", requireAuth(http.HandlerFunc(d.Onboarding.Create)))

	// Outermost wrapper runs first: recover -> log -> cors -> route.
	var handler http.Handler = mux
	handler = middleware.CORS(d.AllowedOrigins)(handler)
	handler = middleware.Logging(handler)
	handler = middleware.Recover(handler)
	return handler
}
