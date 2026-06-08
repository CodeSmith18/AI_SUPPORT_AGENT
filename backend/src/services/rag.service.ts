import {
  listKnowledgeDocuments,
  type KnowledgeDocument
} from "../repositories/knowledge.repository.ts";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "policy",
  "the",
  "to",
  "what",
  "when",
  "where",
  "with",
  "you",
  "your"
]);

export type RetrievedKnowledge = KnowledgeDocument & {
  score: number;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function countOccurrences(text: string, token: string): number {
  const matches = text.match(new RegExp(`\\b${token}\\b`, "gi"));
  return matches?.length ?? 0;
}

function scoreDocument(document: KnowledgeDocument, queryTokens: string[]): number {
  const title = document.title.toLowerCase();
  const category = document.category.toLowerCase();
  const content = document.content.toLowerCase();

  return queryTokens.reduce((score, token) => {
    return (
      score +
      countOccurrences(title, token) * 4 +
      countOccurrences(category, token) * 3 +
      countOccurrences(content, token)
    );
  }, 0);
}

export function retrieveKnowledge(query: string, limit = 3): RetrievedKnowledge[] {
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    return [];
  }

  return listKnowledgeDocuments()
    .map((document) => ({
      ...document,
      score: scoreDocument(document, tokens)
    }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function formatKnowledgeForPrompt(documents: RetrievedKnowledge[]): string {
  if (documents.length === 0) {
    return "No matching store policy documents were retrieved.";
  }

  return documents
    .map((document, index) => {
      return `${index + 1}. ${document.title} (${document.category})\n${document.content}`;
    })
    .join("\n\n");
}
