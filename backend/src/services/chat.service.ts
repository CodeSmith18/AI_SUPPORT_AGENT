import { getOrCreateConversation, findConversationById } from "../repositories/conversation.repository.ts";
import {
  createMessage,
  listMessagesForConversation
} from "../repositories/message.repository.ts";
import type { ChatMessageResponse, Message } from "../types/chat.ts";

function toResponseMessage(message: Message): ChatMessageResponse {
  return {
    id: message.id,
    sender: message.sender,
    text: message.text,
    createdAt: message.createdAt
  };
}

function generatePlaceholderReply(userMessage: string): string {
  return `Thanks for reaching out. I have saved your question: "${userMessage}". The Groq-powered RAG answer will be enabled in the next stage.`;
}

export type SendMessageInput = {
  message: string;
  sessionId?: string;
};

export type SendMessageResult = {
  reply: string;
  sessionId: string;
  messages: ChatMessageResponse[];
};

export function sendMessage(input: SendMessageInput): SendMessageResult {
  const conversation = getOrCreateConversation(input.sessionId);

  createMessage(conversation.id, "user", input.message);

  const reply = generatePlaceholderReply(input.message);
  createMessage(conversation.id, "ai", reply);
  const messages = listMessagesForConversation(conversation.id);

  return {
    reply,
    sessionId: conversation.id,
    messages: messages.map(toResponseMessage)
  };
}

export function getConversationMessages(sessionId: string): ChatMessageResponse[] | undefined {
  const conversation = findConversationById(sessionId);

  if (!conversation) {
    return undefined;
  }

  return listMessagesForConversation(conversation.id).map(toResponseMessage);
}
