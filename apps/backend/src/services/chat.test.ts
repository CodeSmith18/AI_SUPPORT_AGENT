import assert from "node:assert/strict";
import { test } from "node:test";
import { ChatRepository } from "../db/chatRepository.js";
import { createDatabase } from "../db/client.js";
import {
  ChatService,
  ChatValidationError,
  MAX_MESSAGE_LENGTH,
  type GenerateReply
} from "./chat.js";

function createService(generateReply: GenerateReply = async () => "Mock reply") {
  const db = createDatabase(":memory:");
  const repository = new ChatRepository(db);
  const service = new ChatService(repository, generateReply);
  return { db, repository, service };
}

test("sendMessage creates a conversation and persists user and AI messages", async () => {
  const { service } = createService(async ({ history, userMessage }) => {
    assert.equal(userMessage, "What is your return policy?");
    assert.equal(history.length, 1);
    assert.equal(history[0].sender, "user");
    return "You can return items within 30 days.";
  });

  const result = await service.sendMessage({
    message: "What is your return policy?"
  });

  const history = service.getHistory(result.sessionId);

  assert.equal(result.reply, "You can return items within 30 days.");
  assert.ok(result.sessionId);
  assert.equal(history?.length, 2);
  assert.equal(history?.[0].sender, "user");
  assert.equal(history?.[1].sender, "ai");
});

test("sendMessage reuses an existing session", async () => {
  const { service } = createService();

  const first = await service.sendMessage({ message: "Hello" });
  const second = await service.sendMessage({
    message: "Do you ship to USA?",
    sessionId: first.sessionId
  });

  const history = service.getHistory(first.sessionId);

  assert.equal(second.sessionId, first.sessionId);
  assert.equal(history?.length, 4);
});

test("getHistory returns null for missing conversations", () => {
  const { service } = createService();

  assert.equal(service.getHistory("missing-session"), null);
});

test("sendMessage rejects empty messages", async () => {
  const { service } = createService();

  await assert.rejects(
    () => service.sendMessage({ message: "   " }),
    (error) =>
      error instanceof ChatValidationError &&
      error.message === "Message cannot be empty." &&
      error.statusCode === 400
  );
});

test("sendMessage rejects messages over the size limit", async () => {
  const { service } = createService();

  await assert.rejects(
    () => service.sendMessage({ message: "a".repeat(MAX_MESSAGE_LENGTH + 1) }),
    (error) =>
      error instanceof ChatValidationError &&
      error.statusCode === 413
  );
});
