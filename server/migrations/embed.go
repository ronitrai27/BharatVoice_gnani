// Package migrations embeds the SQL files into the binary, so the migrate
// command works without needing the files on disk.
package migrations

import "embed"

//go:embed *.sql
var FS embed.FS
