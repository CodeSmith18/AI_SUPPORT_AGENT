export type LlmMode = "groq" | "mock";

export interface AppConfig {
  port: number;
  frontendOrigin: string;
  sqlitePath: string;
  llmMode: LlmMode;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: numberFromEnv(env.PORT, 3000),
    frontendOrigin: env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    sqlitePath: env.SQLITE_PATH ?? "./data/spur-chat.sqlite",
    llmMode: env.LLM_MODE === "mock" ? "mock" : "groq"
  };
}

function numberFromEnv(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
