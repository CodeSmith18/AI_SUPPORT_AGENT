export type Sender = "user" | "ai";

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

export type ChatMessageResponse = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
};

