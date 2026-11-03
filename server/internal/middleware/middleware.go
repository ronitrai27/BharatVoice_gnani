// Package middleware has the wrappers that run around every request:
// panic recovery, logging, CORS, and authentication.
//
// A middleware is just a function that takes a handler and returns a new
// handler that does something before and/or after calling it.
package middleware

import (
	"log/slog"
	"net/http"
	"slices"
	"strings"
	"time"

	"gnani/server/internal/auth"
	"gnani/server/internal/httpx"
)

// Recover turns a panic inside a handler into a 500 response instead of
// crashing the whole server.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("panic in handler", "panic", rec, "path", r.URL.Path)
				httpx.WriteError(w, http.StatusInternalServerError, "internal_error", "Something went wrong.")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// statusRecorder remembers the status code so the logger can print it.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// Logging prints one line per request.
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		slog.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rec.status,
			"duration", time.Since(start).String(),
		)
	})
}

// CORS lets the Next.js app (a different origin) call this API from the browser.
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" && slices.Contains(allowedOrigins, origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				w.Header().Add("Vary", "Origin")
			}
			// Browsers send an OPTIONS "preflight" request first; answer it here.
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// RequireAuth rejects requests without a valid "Authorization: Bearer <jwt>"
// header, and stores the user id in the request context for handlers to use.
func RequireAuth(verifier *auth.Verifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !ok || token == "" {
				httpx.WriteError(w, http.StatusUnauthorized, "unauthorized", "Missing bearer token.")
				return
			}

			userID, err := verifier.Verify(token)
			if err != nil {
				slog.Debug("token rejected", "error", err)
				httpx.WriteError(w, http.StatusUnauthorized, "unauthorized", "Invalid or expired token.")
				return
			}

			next.ServeHTTP(w, r.WithContext(auth.WithUserID(r.Context(), userID)))
		})
	}
}
