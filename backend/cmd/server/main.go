package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/benebsworth/brainbuilder/backend/internal/catalog"
	"github.com/benebsworth/brainbuilder/backend/internal/httpapi"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := run(ctx, os.Getenv, os.Stderr); err != nil {
		if _, writeErr := fmt.Fprintf(os.Stderr, "%s\n", err); writeErr != nil {
			os.Exit(2)
		}
		os.Exit(1)
	}
}

func run(ctx context.Context, getenv func(string) string, stderr io.Writer) error {
	srv := &http.Server{
		Addr:              serverAddr(getenv),
		Handler:           httpapi.NewHandler(catalog.NewService()),
		ReadHeaderTimeout: 5 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		if _, err := fmt.Fprintf(stderr, "brainbuilder backend listening on %s\n", srv.Addr); err != nil {
			errCh <- fmt.Errorf("write startup message: %w", err)
			return
		}
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- fmt.Errorf("listen and serve: %w", err)
			return
		}
		errCh <- nil
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown server: %w", err)
		}
		return nil
	case err := <-errCh:
		return err
	}
}

func serverAddr(getenv func(string) string) string {
	addr := strings.TrimSpace(getenv("BRAINBUILDER_ADDR"))
	if addr == "" {
		return ":8080"
	}
	return addr
}
