import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig } from "../config.js";
import { createGroqGenerateReply, LlmError } from "./groq.js";

test("Groq generator requires an API key", async () => {
  const generateReply = createGroqGenerateReply(
    loadConfig({
      LLM_MODE: "groq",
      GROQ_API_KEY: "",
      GROQ_API_BASE_URL: "https://api.groq.com/openai/v1"
    })
  );

  await assert.rejects(
    () => generateReply({ history: [], userMessage: "Hello" }),
    (error) =>
      error instanceof LlmError &&
      error.message === "Groq API key is not configured."
  );
});
