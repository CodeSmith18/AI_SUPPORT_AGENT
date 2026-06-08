import type { ChatMessage, KnowledgeSource } from "../types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
  sources?: KnowledgeSource[];
  isStreaming?: boolean;
};

export function MessageBubble({ message, sources = [], isStreaming = false }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const timestamp = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.createdAt));
  const lines = message.text.split("\n");

  return (
    <article className={`message-row ${isUser ? "message-row-user" : "message-row-ai"}`}>
      {!isUser && (
        <span className="message-avatar" aria-hidden="true">
          AI
        </span>
      )}
      <div className={`message-bubble ${isUser ? "message-bubble-user" : "message-bubble-ai"}`}>
        <p className="message-text">
          {lines.map((line, index) => (
            <span className="message-line" key={`${message.id}-${index}`}>
              {line}
            </span>
          ))}
          {isStreaming && <span className="stream-cursor" aria-hidden="true" />}
        </p>
        {sources.length > 0 && (
          <div className="source-list" aria-label="Knowledge sources">
            {sources.map((source) => (
              <span className="source-chip" key={source.id}>
                {source.title}
              </span>
            ))}
          </div>
        )}
        <time dateTime={message.createdAt}>{timestamp}</time>
      </div>
      {isUser && (
        <span className="message-avatar message-avatar-user" aria-hidden="true">
          You
        </span>
      )}
    </article>
  );
}
