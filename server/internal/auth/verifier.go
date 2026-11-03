// Package auth checks the JWT that the Next.js app (Better Auth) gives the
// signed-in user. Go never sees passwords or sessions, it only verifies a
// signed token and reads the user id from it.
package auth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/MicahParks/jwkset"
	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

type Verifier struct {
	keyfunc  keyfunc.Keyfunc
	issuer   string
	audience string
}

// NewVerifier downloads Better Auth's public keys (JWKS) and keeps them fresh.
// If the Next.js app isn't running yet, the server still starts and picks the
// keys up on the next refresh.
func NewVerifier(ctx context.Context, jwksURL, issuer, audience string) (*Verifier, error) {
	storage, err := jwkset.NewStorageFromHTTP(jwksURL, jwkset.HTTPClientStorageOptions{
		Ctx:                       ctx,
		NoErrorReturnFirstHTTPReq: true,
		RefreshInterval:           5 * time.Minute,
		RefreshErrorHandler: func(_ context.Context, err error) {
			slog.Warn("could not refresh auth public keys", "url", jwksURL, "error", err)
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create jwks storage: %w", err)
	}

	kf, err := keyfunc.New(keyfunc.Options{Ctx: ctx, Storage: storage})
	if err != nil {
		return nil, fmt.Errorf("create keyfunc: %w", err)
	}
	return &Verifier{keyfunc: kf, issuer: issuer, audience: audience}, nil
}

// Verify checks the signature, expiry, issuer and audience of a token and
// returns the user id (the "sub" claim).
func (v *Verifier) Verify(token string) (string, error) {
	parsed, err := jwt.ParseWithClaims(
		token,
		&jwt.RegisteredClaims{},
		v.keyfunc.Keyfunc,
		jwt.WithValidMethods([]string{"EdDSA"}), // Better Auth signs with Ed25519
		jwt.WithIssuer(v.issuer),
		jwt.WithAudience(v.audience),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return "", err
	}

	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return "", errors.New("token has no subject")
	}
	return claims.Subject, nil
}
