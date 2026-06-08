import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp, healthPayload } from "./server.js";

test("createApp wires a request handler", () => {
  const server = createApp();

  assert.equal(server.listenerCount("request"), 1);
  server.close();
});

test("health payload exposes service status", () => {
  assert.deepEqual(healthPayload, {
    ok: true,
    service: "spur-ai-live-chat-agent"
  });
});
