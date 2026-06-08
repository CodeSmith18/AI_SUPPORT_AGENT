import type { DatabaseSync } from "node:sqlite";
import { knowledgeSeeds } from "../data/knowledge.seed.ts";

export function seedKnowledgeDocuments(database: DatabaseSync): number {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO knowledge_documents (id, title, category, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  let inserted = 0;

  for (const document of knowledgeSeeds) {
    const result = insert.run(
      document.id,
      document.title,
      document.category,
      document.content,
      now
    );
    inserted += Number(result.changes ?? 0);
  }

  return inserted;
}

