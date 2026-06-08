import type { HistoryResponse, SendMessageResponse } from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

type SendMessageInput = {
  message: string;
  sessionId?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error = data?.error ?? "Something went wrong.";
    throw new Error(error);
  }

  return data as T;
}

export async function sendChatMessage(input: SendMessageInput): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  return parseJsonResponse<SendMessageResponse>(response);
}

export async function fetchChatHistory(sessionId: string): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(sessionId)}/messages`);

  return parseJsonResponse<HistoryResponse>(response);
}

