import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
  auth.options,
);
console.log("tables to create:", toBeCreated.map((t) => t.table));
console.log("columns to add:", toBeAdded.map((t) => t.table));
await runMigrations();
console.log("auth schema migrated");
process.exit(0);
