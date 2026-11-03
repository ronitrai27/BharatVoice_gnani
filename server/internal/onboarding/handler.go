package onboarding

import (
	"errors"
	"log/slog"
	"net/http"

	"gnani/server/internal/auth"
	"gnani/server/internal/httpx"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Options handles GET /v1/onboarding/options (public).
// It returns the choices the onboarding UI should show.
func (h *Handler) Options(w http.ResponseWriter, r *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, map[string]any{
		"languages":  Languages,
		"categories": Categories,
	})
}

// Get handles GET /v1/onboarding. 404 means the user hasn't onboarded yet.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())

	profile, err := h.service.Get(r.Context(), userID)
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "not_found", "Onboarding not completed yet.")
		return
	}
	if err != nil {
		h.internalError(w, "get onboarding", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, profile)
}

// Create handles POST /v1/onboarding.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserID(r.Context())

	var in CreateInput
	if err := httpx.DecodeJSON(w, r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	profile, err := h.service.Complete(r.Context(), userID, in)

	var validationErr *ValidationError
	switch {
	case errors.As(err, &validationErr):
		httpx.WriteValidationError(w, validationErr.Fields)
	case errors.Is(err, ErrAlreadyOnboarded):
		httpx.WriteError(w, http.StatusConflict, "already_onboarded", "You have already completed onboarding.")
	case err != nil:
		h.internalError(w, "create onboarding", err)
	default:
		httpx.WriteJSON(w, http.StatusCreated, profile)
	}
}

// internalError logs the real error for us, but only tells the client
// something generic, so we never leak database details.
func (h *Handler) internalError(w http.ResponseWriter, action string, err error) {
	slog.Error(action, "error", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal_error", "Something went wrong.")
}
