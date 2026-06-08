import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSessionId, validateMessage } from "./validation.ts";

test("validateMessage rejects empty messages", () => {
  assert.deepEqual(validateMessage("   "), {
    ok: false,
    error: "Please enter a message before sending."
  });
});

test("validateMessage trims valid messages", () => {
  assert.deepEqual(validateMessage("  What is your return policy?  "), {
    ok: true,
    message: "What is your return policy?",
    truncated: false
  });
});

test("validateMessage truncates very long messages", () => {
  const result = validateMessage("a".repeat(2100));

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(result.message.length, 2000);
    assert.equal(result.truncated, true);
  }
});

test("normalizeSessionId ignores invalid session ids", () => {
  assert.equal(normalizeSessionId(undefined), undefined);
  assert.equal(normalizeSessionId(" ".repeat(5)), undefined);
  assert.equal(normalizeSessionId("x".repeat(81)), undefined);
});

