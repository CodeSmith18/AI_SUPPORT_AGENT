export type LlmMode = "groq" | "mock";

export interface AppConfig {
  port: number;
  frontendOrigin: string;
  sqlitePath: string;
  llmMode: LlmMode;
  groqApiKey?: string;
  groqApiBaseUrl: string;
  groqModel: string;
  groqTimeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: numberFromEnv(env.PORT, 3000),
    frontendOrigin: env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    sqlitePath: env.SQLITE_PATH ?? "./data/spur-chat.sqlite",
    llmMode: env.LLM_MODE === "mock" ? "mock" : "groq",
    groqApiKey: env.GROQ_API_KEY,
    groqApiBaseUrl: env.GROQ_API_BASE_URL ?? "https://api.groq.com/openai/v1",
    groqModel: env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    groqTimeoutMs: numberFromEnv(env.GROQ_TIMEOUT_MS, 15_000)
  };
}

function numberFromEnv(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
