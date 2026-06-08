import { sendMessage, getConversationMessages } from "../services/chat.service.ts";
import type { JsonResponse } from "../server.ts";
import { normalizeSessionId, validateMessage } from "../utils/validation.ts";

type ChatMessageRequest = {
  message?: unknown;
  sessionId?: unknown;
};

export function handleSendMessage(body: unknown): JsonResponse {
  const payload = (body ?? {}) as ChatMessageRequest;
  const validation = validateMessage(payload.message);

  if (!validation.ok) {
    return {
      status: 400,
      body: {
        error: validation.error
      }
    };
  }

  const result = sendMessage({
    message: validation.message,
    sessionId: normalizeSessionId(payload.sessionId)
  });

  return {
    status: 200,
    body: {
      reply: result.reply,
      sessionId: result.sessionId,
      messages: result.messages,
      truncated: validation.truncated
    }
  };
}

export function handleGetMessages(sessionId: string): JsonResponse {
  const normalizedSessionId = normalizeSessionId(sessionId);

  if (!normalizedSessionId) {
    return {
      status: 400,
      body: {
        error: "Invalid session id."
      }
    };
  }

  const messages = getConversationMessages(normalizedSessionId);

  if (!messages) {
    return {
      status: 404,
      body: {
        error: "Conversation not found."
      }
    };
  }

  return {
    status: 200,
    body: {
      sessionId: normalizedSessionId,
      messages
    }
  };
}

