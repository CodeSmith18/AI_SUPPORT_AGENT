import type { IncomingMessage, ServerResponse } from "node:http";

export async function readJsonBody(req: IncomingMessage, maxBytes = 25_000) {
  const chunks: Buffer[] = [];
  let bytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;

    if (bytes > maxBytes) {
      throw new HttpError("Request body is too large.", 413);
    }

    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError("Request body must be valid JSON.", 400);
  }
}

export function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
  origin: string
) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(payload));
}

export function sendOptions(res: ServerResponse, origin: string) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end();
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500
  ) {
    super(message);
    this.name = "HttpError";
  }
}
