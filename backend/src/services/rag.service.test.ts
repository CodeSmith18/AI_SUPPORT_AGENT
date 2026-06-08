import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

process.env.DATABASE_PATH = join("data", "test-rag.db");

const { getDatabase } = await import("../db/connection.ts");
const { migrateDatabase } = await import("../db/schema.ts");
const { seedKnowledgeDocuments } = await import("../db/seed.ts");
const { retrieveKnowledge } = await import("./rag.service.ts");

migrateDatabase(getDatabase());
seedKnowledgeDocuments(getDatabase());

test("retrieveKnowledge returns international shipping for USA questions", () => {
  const results = retrieveKnowledge("Do you ship to USA?");

  assert.equal(results[0]?.id, "shipping-international");
});

test("retrieveKnowledge returns returns policy for return questions", () => {
  const results = retrieveKnowledge("Can I return an unused product?");

  assert.equal(results[0]?.id, "returns");
});

test("retrieveKnowledge returns no documents for unrelated questions", () => {
  const results = retrieveKnowledge("Tell me a joke about databases");

  assert.deepEqual(results, []);
});

