import { getDatabase } from "./connection.ts";
import { migrateDatabase } from "./schema.ts";
import { seedKnowledgeDocuments } from "./seed.ts";

const database = getDatabase();

migrateDatabase(database);
const inserted = seedKnowledgeDocuments(database);

console.log(`Database setup complete. Seeded ${inserted} knowledge document(s).`);

