import { type FormEvent, type KeyboardEvent } from "react";

type ChatInputProps = {
  value: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChatInput({ value, isSending, onChange, onSubmit }: ChatInputProps) {
  const canSend = value.trim().length > 0 && !isSending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSend) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSend) {
        onSubmit();
      }
    }
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        aria-label="Message"
        disabled={isSending}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about shipping, returns, refunds, or order tracking"
        rows={1}
        value={value}
      />
      <button disabled={!canSend} type="submit">
        Send
      </button>
    </form>
  );
}

