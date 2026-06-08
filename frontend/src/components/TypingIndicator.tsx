export function TypingIndicator() {
  return (
    <div className="message-row message-row-ai" aria-live="polite">
      <div className="typing-indicator" aria-label="Agent is typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

