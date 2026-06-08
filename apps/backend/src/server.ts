import { createServer } from "node:http";
import { loadEnvFile } from "node:process";

try {
  loadEnvFile();
} catch {
  // .env is optional. Production hosts usually inject environment variables.
}

export const healthPayload = {
  ok: true,
  service: "spur-ai-live-chat-agent"
};

export function createApp() {
  return createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(healthPayload));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}
