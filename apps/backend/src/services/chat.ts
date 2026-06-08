import type { ChatRepository, MessageRecord } from "../db/chatRepository.js";

export const MAX_MESSAGE_LENGTH = 2000;
export const HISTORY_LIMIT = 24;

export interface GenerateReplyInput {
  history: MessageRecord[];
  userMessage: string;
}

export type GenerateReply = (input: GenerateReplyInput) => Promise<string>;

export interface SendMessageInput {
  message: unknown;
  sessionId?: unknown;
}

export interface SendMessageResult {
  reply: string;
  sessionId: string;
}

export class ChatValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = "ChatValidationError";
  }
}

export class ChatService {
  constructor(
    private readonly repository: ChatRepository,
    private readonly generateReply: GenerateReply
  ) {}

  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const message = parseMessage(input.message);
    const sessionId = parseOptionalString(input.sessionId, "sessionId");
    const conversation = this.repository.ensureConversation(sessionId);

    this.repository.saveMessage({
      conversationId: conversation.id,
      sender: "user",
      text: message
    });

    const history = this.repository.listMessages(conversation.id, HISTORY_LIMIT);
    const reply = await this.generateReply({
      history,
      userMessage: message
    });

    this.repository.saveMessage({
      conversationId: conversation.id,
      sender: "ai",
      text: reply
    });

    return {
      reply,
      sessionId: conversation.id
    };
  }

  getHistory(sessionId: string): MessageRecord[] | null {
    if (!sessionId.trim()) {
      throw new ChatValidationError("Session ID is required.");
    }

    const conversation = this.repository.getConversation(sessionId);
    if (!conversation) {
      return null;
    }

    return this.repository.listMessages(conversation.id);
  }
}

export const mockGenerateReply: GenerateReply = async ({ userMessage }) => {
  return `Thanks for reaching out. I received: "${userMessage}"`;
};

function parseMessage(value: unknown): string {
  if (typeof value !== "string") {
    throw new ChatValidationError("Message must be a string.");
  }

  const message = value.trim();

  if (!message) {
    throw new ChatValidationError("Message cannot be empty.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ChatValidationError(
      `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      413
    );
  }

  return message;
}

function parseOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ChatValidationError(`${fieldName} must be a string.`);
  }

  return value.trim() || undefined;
}
