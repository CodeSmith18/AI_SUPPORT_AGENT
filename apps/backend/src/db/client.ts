import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function createDatabase(path: string) {
  if (path !== ":memory:") {
    mkdirSync(dirname(resolve(path)), { recursive: true });
  }

  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  initializeSchema(db);
  return db;
}

export function initializeSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
      ON messages (conversation_id, created_at, id);
  `);
}

export type Database = DatabaseSync;
