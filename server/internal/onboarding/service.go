package onboarding

import (
	"context"
	"fmt"
)

// ValidationError carries the per-field messages back up to the handler.
type ValidationError struct {
	Fields Fields
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("invalid onboarding input: %d field(s)", len(e.Fields))
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// Complete validates the answers and saves them for the given user.
func (s *Service) Complete(ctx context.Context, userID string, in CreateInput) (Profile, error) {
	clean, errs := Validate(in)
	if len(errs) > 0 {
		return Profile{}, &ValidationError{Fields: errs}
	}
	return s.repo.Create(ctx, userID, clean)
}

// Get returns the saved onboarding for the user, or ErrNotFound.
func (s *Service) Get(ctx context.Context, userID string) (Profile, error) {
	return s.repo.GetByOwner(ctx, userID)
}
