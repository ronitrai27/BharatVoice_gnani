// Package httpx has small helpers for reading and writing JSON over HTTP, so
// every handler responds in the same shape.
package httpx

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
)

// maxBodyBytes stops a client from sending us a huge request body.
const maxBodyBytes = 1 << 20 // 1 MB

// errorBody is the JSON shape of every error response:
//
//	{"error": {"code": "validation_failed", "message": "...", "fields": {...}}}
type errorBody struct {
	Error errorDetail `json:"error"`
}

type errorDetail struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		slog.Error("write json response", "error", err)
	}
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	WriteJSON(w, status, errorBody{Error: errorDetail{Code: code, Message: message}})
}

// WriteValidationError reports which fields were invalid, so the UI can show
// the message next to the right input.
func WriteValidationError(w http.ResponseWriter, fields map[string]string) {
	WriteJSON(w, http.StatusUnprocessableEntity, errorBody{Error: errorDetail{
		Code:    "validation_failed",
		Message: "Some fields are invalid.",
		Fields:  fields,
	}})
}

// DecodeJSON reads the request body into dst. Unknown fields are rejected so
// typos from the client are caught early.
func DecodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return errors.New("request body must be valid JSON with known fields")
	}
	return nil
}
