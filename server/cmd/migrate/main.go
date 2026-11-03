// Command migrate applies the SQL files in /migrations to the database.
//
//	go run ./cmd/migrate        apply all new migrations (up)
//	go run ./cmd/migrate down   undo the last migration
//	go run ./cmd/migrate status show which migrations have been applied
package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"

	_ "github.com/jackc/pgx/v5/stdlib" // registers the "pgx" database/sql driver

	"gnani/server/migrations"
)

func main() {
	_ = godotenv.Load()

	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("pgx", url)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	goose.SetBaseFS(migrations.FS)
	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal(err)
	}

	command := "up"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}
	if err := goose.RunContext(context.Background(), command, db, "."); err != nil {
		log.Fatal(err)
	}
}
