import { randomUUID } from "node:crypto";
import type { Database } from "./client.js";

export type MessageSender = "user" | "ai";

export interface ConversationRecord {
  id: string;
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
}

interface ConversationRow {
  id: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  created_at: string;
}

export class ChatRepository {
  constructor(private readonly db: Database) {}

  createConversation(id: string = randomUUID()): ConversationRecord {
    this.db
      .prepare("INSERT INTO conversations (id) VALUES (?)")
      .run(id);
    return this.getConversation(id)!;
  }

  getConversation(id: string): ConversationRecord | null {
    const row = this.db
      .prepare("SELECT id, created_at FROM conversations WHERE id = ?")
      .get(id) as ConversationRow | undefined;

    return row ? mapConversation(row) : null;
  }

  ensureConversation(sessionId?: string): ConversationRecord {
    if (sessionId) {
      const existing = this.getConversation(sessionId);
      if (existing) {
        return existing;
      }
    }

    return this.createConversation(sessionId || randomUUID());
  }

  saveMessage(input: {
    conversationId: string;
    sender: MessageSender;
    text: string;
  }): MessageRecord {
    const id = randomUUID();

    this.db
      .prepare(
        "INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)"
      )
      .run(id, input.conversationId, input.sender, input.text);

    return this.getMessage(id)!;
  }

  getMessage(id: string): MessageRecord | null {
    const row = this.db
      .prepare(
        "SELECT id, conversation_id, sender, text, created_at FROM messages WHERE id = ?"
      )
      .get(id) as MessageRow | undefined;

    return row ? mapMessage(row) : null;
  }

  listMessages(conversationId: string, limit = 50): MessageRecord[] {
    const rows = this.db
      .prepare(
        `
          SELECT id, conversation_id, sender, text, created_at
          FROM messages
          WHERE conversation_id = ?
          ORDER BY created_at ASC, rowid ASC
          LIMIT ?
        `
      )
      .all(conversationId, limit) as unknown as MessageRow[];

    return rows.map(mapMessage);
  }
}

function mapConversation(row: ConversationRow): ConversationRecord {
  return {
    id: row.id,
    createdAt: row.created_at
  };
}

function mapMessage(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at
  };
}
