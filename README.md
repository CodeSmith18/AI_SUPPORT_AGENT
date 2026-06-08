# Spur AI Live Chat Agent

Mini AI support chat agent for the Spur founding full-stack engineer take-home.

## Stack

- Frontend: Svelte + Vite
- Backend: Node.js + TypeScript
- Database: SQLite
- LLM: Groq chat completions API

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev:backend
npm run dev:frontend
```

Set `GROQ_API_KEY` in `.env` before using the real LLM. For local development without an API key, set `LLM_MODE=mock`.

## Scripts

```bash
npm run build
npm run test
npm run dev:backend
npm run dev:frontend
```

## Architecture

The backend is structured around small layers:

- `routes`: HTTP parsing, validation, and response formatting
- `services`: chat orchestration and LLM integration
- `db`: SQLite schema and persistence helpers
- `config`: environment-driven runtime settings

The frontend keeps the chat experience focused on a single embedded support widget, with session persistence in `localStorage`.

## LLM Notes

The app uses Groq's OpenAI-compatible chat completions endpoint by default:

- Base URL: `https://api.groq.com/openai/v1`
- Default model: `llama-3.3-70b-versatile`

The model, timeout, and mode are configurable through environment variables.

## Tradeoffs

- SQLite keeps setup simple for the assignment. For production, PostgreSQL would be a better default.
- No auth is included because the assignment explicitly does not require it.
- Conversation history is capped before sending to the LLM to control cost and latency.

## If I Had More Time

- Add streaming responses.
- Add an admin view for conversation transcripts.
- Add retrieval over editable FAQ documents.
- Add rate limiting and abuse protection.
