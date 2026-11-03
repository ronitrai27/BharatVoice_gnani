// Command api starts the HTTP server.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"gnani/server/internal/auth"
	"gnani/server/internal/config"
	"gnani/server/internal/database"
	"gnani/server/internal/onboarding"
	"gnani/server/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

// run does the real work and returns an error, so main stays tiny.
func run() error {
	// Load server/.env if it exists (local development). Real environment
	// variables, like on a production host, always win.
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// ctx is cancelled when the user presses Ctrl+C or the host sends SIGTERM.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	verifier, err := auth.NewVerifier(ctx, cfg.AuthJWKSURL, cfg.AuthIssuer, cfg.AuthAudience)
	if err != nil {
		return err
	}

	// Build the onboarding feature: repository -> service -> handler.
	onboardingRepo := onboarding.NewPostgresRepository(pool)
	onboardingService := onboarding.NewService(onboardingRepo)
	onboardingHandler := onboarding.NewHandler(onboardingService)

	srv := &http.Server{
		Addr: ":" + cfg.Port,
		Handler: server.NewRouter(server.Deps{
			Verifier:       verifier,
			Onboarding:     onboardingHandler,
			AllowedOrigins: cfg.AllowedOrigins,
		}),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// Run the server in the background so we can wait for the shutdown signal.
	serverErr := make(chan error, 1)
	go func() {
		slog.Info("server listening", "addr", srv.Addr)
		serverErr <- srv.ListenAndServe()
	}()

	select {
	case err := <-serverErr:
		return err
	case <-ctx.Done():
		slog.Info("shutting down")
	}

	// Give in-flight requests a few seconds to finish.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}
