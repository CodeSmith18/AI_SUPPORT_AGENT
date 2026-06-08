import type { JsonResponse } from "../server.ts";

export function handleHealth(): JsonResponse {
  return {
    status: 200,
    body: {
      ok: true,
      service: "spur-ai-support-backend"
    }
  };
}

