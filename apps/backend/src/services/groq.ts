import type { AppConfig } from "../config.js";
import type { GenerateReply } from "./chat.js";
import { SUPPORT_AGENT_SYSTEM_PROMPT } from "./knowledge.js";

interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class LlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmError";
  }
}

export function createGroqGenerateReply(config: AppConfig): GenerateReply {
  return async ({ history }) => {
    if (!config.groqApiKey) {
      throw new LlmError("Groq API key is not configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.groqTimeoutMs);

    try {
      const response = await fetch(`${config.groqApiBaseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${config.groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: config.groqModel,
          temperature: 0.3,
          max_tokens: 350,
          messages: toGroqMessages(history)
        })
      });

      if (!response.ok) {
        throw new LlmError(`Groq request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as GroqChatResponse;
      const reply = payload.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        throw new LlmError("Groq returned an empty response.");
      }

      return reply;
    } catch (error) {
      if (error instanceof LlmError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new LlmError("Groq request timed out.");
      }

      throw new LlmError("Groq request failed.");
    } finally {
      clearTimeout(timeout);
    }
  };
}

function toGroqMessages(history: Parameters<GenerateReply>[0]["history"]) {
  const messages: GroqChatMessage[] = [
    {
      role: "system",
      content: SUPPORT_AGENT_SYSTEM_PROMPT
    }
  ];

  for (const message of history.slice(-16)) {
    messages.push({
      role: message.sender === "ai" ? "assistant" : "user",
      content: message.text
    });
  }

  return messages;
}
