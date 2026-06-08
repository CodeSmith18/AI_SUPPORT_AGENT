import { randomUUID } from "node:crypto";
import { getDatabase } from "../db/connection.ts";
import type { Message, Sender } from "../types/chat.ts";
import { touchConversation } from "./conversation.repository.ts";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender: Sender;
  text: string;
  created_at: string;
};

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at
  };
}

export function createMessage(conversationId: string, sender: Sender, text: string): Message {
  const now = new Date().toISOString();
  const message: Message = {
    id: randomUUID(),
    conversationId,
    sender,
    text,
    createdAt: now
  };

  getDatabase()
    .prepare(
      `
      INSERT INTO messages (id, conversation_id, sender, text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .run(message.id, message.conversationId, message.sender, message.text, message.createdAt);

  touchConversation(conversationId);

  return message;
}

export function listMessagesForConversation(conversationId: string): Message[] {
  const rows = getDatabase()
    .prepare(
      `
      SELECT id, conversation_id, sender, text, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `
    )
    .all(conversationId) as MessageRow[];

  return rows.map(mapMessage);
}

export function listRecentMessagesForConversation(
  conversationId: string,
  limit: number
): Message[] {
  const rows = getDatabase()
    .prepare(
      `
      SELECT id, conversation_id, sender, text, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `
    )
    .all(conversationId, limit) as MessageRow[];

  return rows.map(mapMessage).reverse();
}

