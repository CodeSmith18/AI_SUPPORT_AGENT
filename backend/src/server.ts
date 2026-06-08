import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { getDatabase } from "./db/connection.ts";
import { migrateDatabase } from "./db/schema.ts";
import { seedKnowledgeDocuments } from "./db/seed.ts";
import { handleGetMessages, handleSendMessage } from "./routes/chat.routes.ts";
import { getEnv } from "./utils/env.ts";
import { handleHealth } from "./routes/health.routes.ts";

export type JsonResponse = {
  status: number;
  body: unknown;
};

const env = getEnv();
const MAX_BODY_BYTES = 20_000;

migrateDatabase(getDatabase());
seedKnowledgeDocuments(getDatabase());

function sendJson(response: ServerResponse, payload: JsonResponse): void {
  response.writeHead(payload.status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": env.frontendOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(JSON.stringify(payload.body));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;

    if (bytes > MAX_BODY_BYTES) {
      throw new Error("Request body is too large.");
    }

    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

async function route(request: IncomingMessage): Promise<JsonResponse> {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return handleHealth();
  }

  if (request.method === "POST" && url.pathname === "/chat/message") {
    const body = await readJsonBody(request);
    return handleSendMessage(body);
  }

  const messageMatch = url.pathname.match(/^\/chat\/([^/]+)\/messages$/);

  if (request.method === "GET" && messageMatch) {
    return handleGetMessages(decodeURIComponent(messageMatch[1]));
  }

  return {
    status: 404,
    body: {
      error: "Route not found"
    }
  };
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, { status: 204, body: null });
    return;
  }

  try {
    sendJson(response, await route(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    sendJson(response, {
      status: message.includes("too large") || message.includes("valid JSON") ? 400 : 500,
      body: {
        error: message
      }
    });
  }
});

server.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
