import { useEffect, useMemo, useRef, useState } from "react";
import { fetchChatHistory, sendChatMessage } from "../api/chatApi";
import type { ChatMessage, KnowledgeSource } from "../types/chat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

const SESSION_STORAGE_KEY = "spur-ai-support-session-id";

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
  const endRef = useRef<HTMLDivElement | null>(null);

  const latestAiMessageId = useMemo(() => {
    return [...messages].reverse().find((message) => message.sender === "ai")?.id;
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, error]);

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
  }, [sessionId]);

  async function handleSend() {
    const text = input.trim();

    if (!text || isSending) {
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
    setIsSending(true);

    try {
      const response = await sendChatMessage({ message: text, sessionId });
      window.localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
      setSessionId(response.sessionId);
      setMessages(response.messages.length > 0 ? response.messages : [optimisticMessage]);
      setLatestSources(response.sources);

      if (response.truncated) {
        setError("Your message was shortened before sending because it was very long.");
      }
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "The support agent could not reply right now.";
      setError(message);
      setMessages((currentMessages) => currentMessages.filter((item) => item.id !== optimisticMessage.id));
      setInput(text);
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
            sources={message.id === latestAiMessageId ? latestSources : []}
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

      <ChatInput isSending={isSending || isLoadingHistory} onChange={setInput} onSubmit={handleSend} value={input} />
    </section>
  );
}

