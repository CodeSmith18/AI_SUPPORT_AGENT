import type { ChatMessage, KnowledgeSource } from "../types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
  sources?: KnowledgeSource[];
};

export function MessageBubble({ message, sources = [] }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const timestamp = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.createdAt));

  return (
    <article className={`message-row ${isUser ? "message-row-user" : "message-row-ai"}`}>
      <div className={`message-bubble ${isUser ? "message-bubble-user" : "message-bubble-ai"}`}>
        <p>{message.text}</p>
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
    </article>
  );
}

