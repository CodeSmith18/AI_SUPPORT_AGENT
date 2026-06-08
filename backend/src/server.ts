import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, resolve } from "node:path";
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
const FRONTEND_DIST_ROOT = resolve(env.frontendDistPath);

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

migrateDatabase(getDatabase());
seedKnowledgeDocuments(getDatabase());

function resolveCorsOrigin(request: IncomingMessage): string {
  const requestOrigin = request.headers.origin;
  const allowedOrigins = new Set([
    env.frontendOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]);

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    return requestOrigin;
  }

  return env.frontendOrigin;
}

function sendJson(request: IncomingMessage, response: ServerResponse, payload: JsonResponse): void {
  response.writeHead(payload.status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": resolveCorsOrigin(request),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(JSON.stringify(payload.body));
}

function isApiPath(pathname: string): boolean {
  return pathname === "/health" || pathname === "/chat/message" || pathname.startsWith("/chat/");
}

function getStaticFilePath(pathname: string): string | undefined {
  const safePathname = decodeURIComponent(pathname);
  const requestedPath = safePathname === "/" ? "index.html" : safePathname.slice(1);
  const filePath = resolve(FRONTEND_DIST_ROOT, requestedPath);

  if (!filePath.startsWith(FRONTEND_DIST_ROOT)) {
    return undefined;
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }

  const indexPath = resolve(FRONTEND_DIST_ROOT, "index.html");

  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    return indexPath;
  }

  return undefined;
}

function sendStaticFile(request: IncomingMessage, response: ServerResponse, filePath: string): void {
  const extension = extname(filePath);
  const contentType = MIME_TYPES.get(extension) ?? "application/octet-stream";

  response.writeHead(200, {
    "Content-Type": contentType
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
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
    return await handleSendMessage(body);
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
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    sendJson(request, response, { status: 204, body: null });
    return;
  }

  try {
    if ((request.method === "GET" || request.method === "HEAD") && !isApiPath(url.pathname)) {
      const staticFilePath = getStaticFilePath(url.pathname);

      if (staticFilePath) {
        sendStaticFile(request, response, staticFilePath);
        return;
      }
    }

    sendJson(request, response, await route(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    sendJson(request, response, {
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
