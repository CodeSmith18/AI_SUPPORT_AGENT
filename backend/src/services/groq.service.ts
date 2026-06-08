import { getEnv } from "../utils/env.ts";
import { formatKnowledgeForPrompt, type RetrievedKnowledge } from "./rag.service.ts";
import type { Message } from "../types/chat.ts";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GenerateReplyInput = {
  userMessage: string;
  history: Message[];
  knowledge: RetrievedKnowledge[];
};

type GroqChoice = {
  message?: {
    content?: string;
  };
};

type GroqChatResponse = {
  choices?: GroqChoice[];
};

function toGroqHistory(history: Message[]): GroqMessage[] {
  return history.map((message) => ({
    role: message.sender === "ai" ? "assistant" : "user",
    content: message.text
  }));
}

function fallbackReply(knowledge: RetrievedKnowledge[]): string {
  if (knowledge.length === 0) {
    return "I am not fully sure based on the store policies I found. Please contact AuroraMart support at support@auroramart.example for the most accurate help.";
  }

  const topDocument = knowledge[0];
  return `Based on AuroraMart policy: ${topDocument.content}`;
}

export async function generateReply(input: GenerateReplyInput): Promise<string> {
  const env = getEnv();

  if (!env.groqApiKey) {
    return fallbackReply(input.knowledge);
  }

  const knowledgeContext = formatKnowledgeForPrompt(input.knowledge);
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: [
        "You are a helpful support agent for AuroraMart, a small e-commerce store.",
        "Answer clearly, concisely, and warmly.",
        "Use the retrieved store knowledge when it is relevant.",
        "If the answer is not supported by the retrieved knowledge, say you are not fully sure and suggest contacting support@auroramart.example.",
        "",
        "Retrieved store knowledge:",
        knowledgeContext
      ].join("\n")
    },
    ...toGroqHistory(input.history)
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.groqApiKey}`
      },
      body: JSON.stringify({
        model: env.groqModel,
        messages,
        temperature: 0.2,
        max_tokens: 350
      }),
      signal: AbortSignal.timeout(15_000)
    });

    if (!response.ok) {
      return fallbackReply(input.knowledge);
    }

    const data = (await response.json()) as GroqChatResponse;
    const reply = data.choices?.[0]?.message?.content?.trim();

    return reply || fallbackReply(input.knowledge);
  } catch {
    return fallbackReply(input.knowledge);
  }
}

