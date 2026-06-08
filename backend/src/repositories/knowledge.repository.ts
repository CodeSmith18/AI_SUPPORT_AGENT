import { getDatabase } from "../db/connection.ts";

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
};

type KnowledgeRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
};

function mapKnowledgeDocument(row: KnowledgeRow): KnowledgeDocument {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    createdAt: row.created_at
  };
}

export function listKnowledgeDocuments(): KnowledgeDocument[] {
  const rows = getDatabase()
    .prepare(
      `
      SELECT id, title, category, content, created_at
      FROM knowledge_documents
      ORDER BY category, title
    `
    )
    .all() as KnowledgeRow[];

  return rows.map(mapKnowledgeDocument);
}

