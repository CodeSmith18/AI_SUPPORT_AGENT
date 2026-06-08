import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { getEnv } from "./utils/env.ts";
import { handleHealth } from "./routes/health.routes.ts";

export type JsonResponse = {
  status: number;
  body: unknown;
};

const env = getEnv();

function sendJson(response: ServerResponse, payload: JsonResponse): void {
  response.writeHead(payload.status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": env.frontendOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(JSON.stringify(payload.body));
}

function route(request: IncomingMessage): JsonResponse {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    return handleHealth();
  }

  return {
    status: 404,
    body: {
      error: "Route not found"
    }
  };
}

const server = createServer((request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, { status: 204, body: null });
    return;
  }

  sendJson(response, route(request));
});

server.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});

