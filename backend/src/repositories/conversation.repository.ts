import { randomUUID } from "node:crypto";
import { getDatabase } from "../db/connection.ts";
import type { Conversation } from "../types/chat.ts";

type ConversationRow = {
  id: string;
  created_at: string;
  updated_at: string;
};

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createConversation(): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now
  };

  getDatabase()
    .prepare(
      `
      INSERT INTO conversations (id, created_at, updated_at)
      VALUES (?, ?, ?)
    `
    )
    .run(conversation.id, conversation.createdAt, conversation.updatedAt);

  return conversation;
}

export function findConversationById(id: string): Conversation | undefined {
  const row = getDatabase()
    .prepare(
      `
      SELECT id, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `
    )
    .get(id) as ConversationRow | undefined;

  return row ? mapConversation(row) : undefined;
}

export function getOrCreateConversation(sessionId?: string): Conversation {
  if (sessionId) {
    const existing = findConversationById(sessionId);

    if (existing) {
      return existing;
    }
  }

  return createConversation();
}

export function touchConversation(id: string): void {
  getDatabase()
    .prepare(
      `
      UPDATE conversations
      SET updated_at = ?
      WHERE id = ?
    `
    )
    .run(new Date().toISOString(), id);
}

