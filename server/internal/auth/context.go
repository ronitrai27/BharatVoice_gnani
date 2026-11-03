package auth

import "context"

// contextKey is a private type so no other package can accidentally use the
// same key and overwrite our value in the request context.
type contextKey struct{}

// WithUserID returns a copy of ctx that carries the signed-in user's id.
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, contextKey{}, userID)
}

// UserID returns the signed-in user's id, set by the auth middleware.
func UserID(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(contextKey{}).(string)
	return id, ok
}
