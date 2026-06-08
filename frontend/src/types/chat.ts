export type Sender = "user" | "ai";

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

export type KnowledgeSource = {
  id: string;
  title: string;
  category: string;
};

export type SendMessageResponse = {
  reply: string;
  sessionId: string;
  messages: ChatMessage[];
  sources: KnowledgeSource[];
  truncated: boolean;
};

export type HistoryResponse = {
  sessionId: string;
  messages: ChatMessage[];
};

