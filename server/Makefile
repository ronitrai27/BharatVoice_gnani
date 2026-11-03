.PHONY: run migrate migrate-down test vet build

run:
	go run ./cmd/api

migrate:
	go run ./cmd/migrate up

migrate-down:
	go run ./cmd/migrate down

test:
	go test ./...

vet:
	go vet ./...

build:
	go build -o bin/api ./cmd/api
