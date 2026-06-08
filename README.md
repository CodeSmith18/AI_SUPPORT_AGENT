# Spur AI Support Agent

Mini AI live chat support agent for the Spur founding full-stack engineer assignment. The app simulates an e-commerce support widget for AuroraMart, persists conversations, retrieves relevant store knowledge, and uses Groq to generate concise support replies.

## Live Demo

Deployed app:

```txt
https://ai-support-agent-dni5.onrender.com
```

Health endpoint:

```txt
https://ai-support-agent-dni5.onrender.com/health
```

Free-tier note: the deployed demo uses SQLite on Render's local filesystem, so chat history can reset when the service restarts, redeploys, or spins down. For production, this should move to Postgres.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js 24, TypeScript, built-in HTTP server
- Database: SQLite through Node's built-in `node:sqlite`
- LLM: Groq chat completions
- RAG: Seeded store knowledge plus keyword retrieval

## Features

- AI support chat widget for a fictional e-commerce store.
- Real Groq LLM integration through environment variables.
- Mini-RAG retrieval over seeded store policy documents.
- Persisted conversations and messages in SQLite.
- Reloadable chat history through `sessionId`.
- Fast word-by-word AI response reveal in the UI.
- Source chips showing which knowledge documents informed the latest answer.
- Friendly handling for empty input, long input, invalid JSON, and LLM failures.
- No hard-coded secrets.

## Project Structure

```txt
backend/
  src/
    data/              Seeded AuroraMart knowledge
    db/                SQLite connection, schema, seed setup
    repositories/      Conversation, message, knowledge persistence
    routes/            HTTP route handlers
    services/          Chat orchestration, Groq, mini-RAG
    utils/             Env and validation helpers

frontend/
  src/
    api/               Backend API client
    components/        Chat widget UI
    types/             Shared frontend chat types
```

## Local Setup

Requirements:

- Node.js 24 or newer
- npm
- Groq API key

Clone and enter the repository:

```bash
git clone https://github.com/CodeSmith18/AI_SUPPORT_AGENT.git
cd AI_SUPPORT_AGENT
```

### Backend

```bash
cd backend
cp .env.example .env
```

Update `backend/.env`:

```txt
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/spur-support.db
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Set up SQLite tables and seed knowledge:

```bash
npm run db:setup
```

Run the backend:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at:

```txt
http://localhost:5173
```

Open the app in your browser and ask questions like:

```txt
Do you ship to USA?
What is your return policy?
How long do refunds take?
What are your support hours?
```

## Deployment

The deployed version is prepared from the deployment branch:

```txt
codex/deploy-free-platform
```

That branch contains Render-specific deployment config. The backend serves both the API and the built React frontend from one Render web service.

Render build command:

```bash
cd frontend && npm ci --include=dev && npm run build && cd ../backend && npm run db:setup
```

Render start command:

```bash
cd backend && npm run start
```

Required Render environment variables:

```txt
NODE_ENV=production
FRONTEND_DIST_PATH=../frontend/dist
DATABASE_PATH=./data/spur-support.db
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your_groq_api_key_here
```

## API

```txt
GET /health
POST /chat/message
GET /chat/:sessionId/messages
```

Send message request:

```json
{
  "message": "Do you ship to USA?",
  "sessionId": "optional-existing-session-id"
}
```

Response:

```json
{
  "reply": "Yes, we ship to the USA...",
  "sessionId": "conversation-id",
  "messages": [],
  "sources": [],
  "truncated": false
}
```

## Mini RAG Design

The knowledge base is seeded with fictional AuroraMart policies:

- domestic shipping
- international shipping
- returns
- refunds
- support hours
- order tracking
- payments

For every user message, the backend:

1. Validates and trims the input.
2. Creates or reuses a conversation.
3. Persists the user message.
4. Retrieves the top matching knowledge documents using keyword scoring.
5. Sends retrieved knowledge plus recent conversation history to Groq.
6. Persists the AI reply.
7. Returns the reply, session ID, message history, and source metadata.

If `GROQ_API_KEY` is missing or Groq fails, the app falls back to a policy-based reply from retrieved knowledge instead of crashing.

## Groq Prompting

The system prompt tells the model to act as a helpful AuroraMart support agent, answer clearly and concisely, use retrieved store knowledge when relevant, and avoid making unsupported claims. If retrieved knowledge does not answer the question, it suggests contacting support.

Default model:

```txt
llama-3.3-70b-versatile
```

## Robustness

Implemented safeguards:

- Empty messages are rejected.
- Very long messages are truncated server-side.
- Invalid JSON returns a clean error.
- Request body size is capped.
- LLM/network failures are caught.
- Conversations and messages are persisted.
- Chat history reloads from `sessionId`.
- Secrets are loaded from `.env` and ignored by Git.

## Scripts

Backend:

```bash
npm run db:setup
npm run dev
npm run start
npm run check
npm test
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Verification

Current local checks:

```bash
cd backend && npm test
cd backend && npm run check
cd frontend && npm run build
```

Manual browser smoke test:

- Opened React app.
- Sent `Do you ship to USA?`.
- Received a Groq-generated answer.
- Confirmed `International shipping policy` source chip rendered.
- Confirmed no browser console errors.

## Trade-offs

- Used Node's built-in HTTP server and SQLite support to keep the backend dependency-light.
- Used keyword retrieval instead of embeddings/vector search. For this assignment's small FAQ set, this is simpler, explainable, and reliable.
- Source chips are shown for the latest reply but not persisted separately. Persisting retrieved source IDs per AI message would be a natural next step.
- No authentication because the assignment explicitly does not require it.

## If I Had More Time

- Add SQLite FTS5 or embeddings-based retrieval.
- Persist source citations per AI message.
- Add streaming responses from Groq.
- Add deployment-ready Postgres support.
- Add Playwright end-to-end tests.
- Add an admin UI for editing knowledge documents.
