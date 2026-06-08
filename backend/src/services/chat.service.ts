import { getOrCreateConversation, findConversationById } from "../repositories/conversation.repository.ts";
import {
  createMessage,
  listMessagesForConversation,
  listRecentMessagesForConversation
} from "../repositories/message.repository.ts";
import type { ChatMessageResponse, Message } from "../types/chat.ts";
import { generateReply } from "./groq.service.ts";
import { retrieveKnowledge } from "./rag.service.ts";

const RECENT_HISTORY_LIMIT = 10;

function toResponseMessage(message: Message): ChatMessageResponse {
  return {
    id: message.id,
    sender: message.sender,
    text: message.text,
    createdAt: message.createdAt
  };
}

export type SendMessageInput = {
  message: string;
  sessionId?: string;
};

export type SendMessageResult = {
  reply: string;
  sessionId: string;
  messages: ChatMessageResponse[];
  sources: {
    id: string;
    title: string;
    category: string;
  }[];
};

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const conversation = getOrCreateConversation(input.sessionId);

  createMessage(conversation.id, "user", input.message);

  const history = listRecentMessagesForConversation(conversation.id, RECENT_HISTORY_LIMIT);
  const knowledge = retrieveKnowledge(input.message);
  const reply = await generateReply({
    userMessage: input.message,
    history,
    knowledge
  });

  createMessage(conversation.id, "ai", reply);
  const messages = listMessagesForConversation(conversation.id);

  return {
    reply,
    sessionId: conversation.id,
    messages: messages.map(toResponseMessage),
    sources: knowledge.map((document) => ({
      id: document.id,
      title: document.title,
      category: document.category
    }))
  };
}

export function getConversationMessages(sessionId: string): ChatMessageResponse[] | undefined {
  const conversation = findConversationById(sessionId);

  if (!conversation) {
    return undefined;
  }

  return listMessagesForConversation(conversation.id).map(toResponseMessage);
}
