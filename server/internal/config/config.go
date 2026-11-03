// Package config loads the server settings from environment variables.
//
// Keeping all os.Getenv calls in one place means the rest of the code never
// reads the environment directly, which makes it easy to see (and test)
// everything the server depends on.
package config

import (
	"errors"
	"os"
	"strings"
)

type Config struct {
	Port string

	// DatabaseURL is the Postgres connection string (Neon).
	DatabaseURL string

	// The Next.js app (Better Auth) signs the user's JWT. We verify it with
	// the public keys published at AuthJWKSURL.
	AuthJWKSURL  string
	AuthIssuer   string
	AuthAudience string

	// AllowedOrigins are the browser origins allowed to call this API (CORS).
	AllowedOrigins []string
}

// Load reads the configuration and returns an error if something required is
// missing, so the server fails fast at startup instead of at the first request.
func Load() (Config, error) {
	cfg := Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		AuthJWKSURL:    getEnv("AUTH_JWKS_URL", "http://localhost:3000/api/auth/jwks"),
		AuthIssuer:     getEnv("AUTH_ISSUER", "http://localhost:3000"),
		AuthAudience:   getEnv("AUTH_AUDIENCE", "http://localhost:3000"),
		AllowedOrigins: splitList(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitList(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}
