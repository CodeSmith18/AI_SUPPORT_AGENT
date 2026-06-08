import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { loadConfig, type AppConfig } from "./config.js";
import { ChatRepository } from "./db/chatRepository.js";
import { createDatabase, type Database } from "./db/client.js";
import { handleChatRoute } from "./routes/chat.js";
import { sendJson, sendOptions } from "./routes/http.js";
import { ChatService, mockGenerateReply, type GenerateReply } from "./services/chat.js";

try {
  loadEnvFile();
} catch {
  // .env is optional. Production hosts usually inject environment variables.
}

export const healthPayload = {
  ok: true,
  service: "spur-ai-live-chat-agent"
};

export interface CreateAppOptions {
  config?: AppConfig;
  db?: Database;
  generateReply?: GenerateReply;
}

export function createApp(options: CreateAppOptions = {}) {
  const config = options.config ?? loadConfig();
  const db = options.db ?? createDatabase(config.sqlitePath);
  const repository = new ChatRepository(db);
  const chatService = new ChatService(
    repository,
    options.generateReply ?? mockGenerateReply
  );

  return createServer(async (req, res) => {
    const origin = config.frontendOrigin;

    if (req.method === "OPTIONS") {
      sendOptions(res, origin);
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, healthPayload, origin);
      return;
    }

    const handled = await handleChatRoute({
      req,
      res,
      url,
      origin,
      chatService
    });

    if (!handled) {
      sendJson(res, 404, { error: "Route not found." }, origin);
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}
