const MAX_MESSAGE_LENGTH = 2000;
const MAX_SESSION_ID_LENGTH = 80;

export type MessageValidationResult =
  | {
      ok: true;
      message: string;
      truncated: boolean;
    }
  | {
      ok: false;
      error: string;
    };

export function validateMessage(input: unknown): MessageValidationResult {
  if (typeof input !== "string") {
    return {
      ok: false,
      error: "Message must be a string."
    };
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: "Please enter a message before sending."
    };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: true,
      message: trimmed.slice(0, MAX_MESSAGE_LENGTH),
      truncated: true
    };
  }

  return {
    ok: true,
    message: trimmed,
    truncated: false
  };
}

export function normalizeSessionId(input: unknown): string | undefined {
  if (typeof input !== "string") {
    return undefined;
  }

  const trimmed = input.trim();

  if (!trimmed || trimmed.length > MAX_SESSION_ID_LENGTH) {
    return undefined;
  }

  return trimmed;
}

