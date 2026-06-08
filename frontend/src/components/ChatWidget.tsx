import { useEffect, useMemo, useRef, useState } from "react";
import { fetchChatHistory, sendChatMessage } from "../api/chatApi";
import type { ChatMessage, KnowledgeSource } from "../types/chat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

const SESSION_STORAGE_KEY = "spur-ai-support-session-id";
const REVEAL_DELAY_MS = 38;

const welcomeMessage: ChatMessage = {
  id: "welcome",
  sender: "ai",
  text: "Hi, I am AuroraMart support. I can help with shipping, returns, refunds, orders, and payments.",
  createdAt: new Date().toISOString()
};

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(sessionId));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [latestSources, setLatestSources] = useState<KnowledgeSource[]>([]);
  const [revealingMessageId, setRevealingMessageId] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement | null>(null);
  const revealRunRef = useRef(0);

  const latestAiMessageId = useMemo(() => {
    return [...messages].reverse().find((message) => message.sender === "ai")?.id;
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, error, revealingMessageId]);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!sessionId) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const history = await fetchChatHistory(sessionId);

        if (isMounted) {
          setMessages(history.messages.length > 0 ? history.messages : [welcomeMessage]);
        }
      } catch {
        if (isMounted) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setSessionId(undefined);
          setMessages([welcomeMessage]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      revealRunRef.current += 1;
    };
  }, []);

  function splitReplyIntoWords(text: string): string[] {
    return text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  }

  async function revealAiMessage(message: ChatMessage) {
    const runId = revealRunRef.current + 1;
    revealRunRef.current = runId;
    const words = splitReplyIntoWords(message.text);

    if (words.length === 0) {
      setRevealingMessageId(undefined);
      return;
    }

    setRevealingMessageId(message.id);

    for (let index = 1; index <= words.length; index += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, REVEAL_DELAY_MS));

      if (revealRunRef.current !== runId) {
        return;
      }

      const visibleText = words.slice(0, index).join(" ");
      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage.id === message.id ? { ...currentMessage, text: visibleText } : currentMessage
        )
      );
    }

    if (revealRunRef.current === runId) {
      setRevealingMessageId(undefined);
    }
  }

  async function handleSend() {
    const text = input.trim();

    if (!text || isSending || revealingMessageId) {
      return;
    }

    const optimisticMessage: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      sender: "user",
      text,
      createdAt: new Date().toISOString()
    };

    setMessages((currentMessages) => [...currentMessages, optimisticMessage]);
    setInput("");
    setError(undefined);
    setLatestSources([]);
    setRevealingMessageId(undefined);
    setIsSending(true);

    try {
      const response = await sendChatMessage({ message: text, sessionId });
      const latestAiMessage = [...response.messages].reverse().find((message) => message.sender === "ai");
      const nextMessages = latestAiMessage
        ? response.messages.map((message) =>
            message.id === latestAiMessage.id ? { ...message, text: "" } : message
          )
        : response.messages;

      window.localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
      setSessionId(response.sessionId);
      setMessages(nextMessages.length > 0 ? nextMessages : [optimisticMessage]);
      setLatestSources(response.sources);

      if (response.truncated) {
        setError("Your message was shortened before sending because it was very long.");
      }

      if (latestAiMessage) {
        void revealAiMessage(latestAiMessage);
      }
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "The support agent could not reply right now.";
      setError(message);
      setMessages((currentMessages) => currentMessages.filter((item) => item.id !== optimisticMessage.id));
      setInput(text);
      setRevealingMessageId(undefined);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="chat-panel" aria-label="AI support chat">
      <header className="chat-header">
        <div>
          <p className="eyebrow">AuroraMart support</p>
          <h1>AI Live Chat Agent</h1>
        </div>
        <span className="status-pill">Online</span>
      </header>

      <div className="message-list" aria-busy={isLoadingHistory || isSending}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={message.id === revealingMessageId}
            sources={message.id === latestAiMessageId && message.id !== revealingMessageId ? latestSources : []}
          />
        ))}
        {isSending && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="error-banner" role="status">
          {error}
        </div>
      )}

      <ChatInput
        isSending={isSending || isLoadingHistory || Boolean(revealingMessageId)}
        onChange={setInput}
        onSubmit={handleSend}
        value={input}
      />
    </section>
  );
}
