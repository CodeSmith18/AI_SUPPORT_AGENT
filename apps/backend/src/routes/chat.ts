import type { IncomingMessage, ServerResponse } from "node:http";
import { ChatValidationError, type ChatService } from "../services/chat.js";
import { HttpError, readJsonBody, sendJson } from "./http.js";

export async function handleChatRoute(input: {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  origin: string;
  chatService: ChatService;
}) {
  const { req, res, url, origin, chatService } = input;

  try {
    if (req.method === "POST" && url.pathname === "/chat/message") {
      const body = await readJsonBody(req);

      if (!isObject(body)) {
        throw new HttpError("Request body must be a JSON object.", 400);
      }

      const result = await chatService.sendMessage({
        message: body.message,
        sessionId: body.sessionId
      });

      sendJson(res, 200, result, origin);
      return true;
    }

    if (req.method === "GET" && url.pathname.startsWith("/chat/")) {
      const sessionId = decodeURIComponent(url.pathname.replace("/chat/", ""));
      const messages = chatService.getHistory(sessionId);

      if (!messages) {
        sendJson(res, 404, { error: "Conversation was not found." }, origin);
        return true;
      }

      sendJson(res, 200, { sessionId, messages }, origin);
      return true;
    }

    return false;
  } catch (error) {
    if (error instanceof ChatValidationError || error instanceof HttpError) {
      sendJson(res, error.statusCode, { error: error.message }, origin);
      return true;
    }

    console.error(error);
    sendJson(
      res,
      500,
      { error: "Something went wrong. Please try again in a moment." },
      origin
    );
    return true;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
