import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getEnv } from "../utils/env.ts";

let database: DatabaseSync | undefined;

export function getDatabase(): DatabaseSync {
  if (database) {
    return database;
  }

  const env = getEnv();
  const databasePath = resolve(env.databasePath);
  mkdirSync(dirname(databasePath), { recursive: true });

  database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");

  return database;
}

