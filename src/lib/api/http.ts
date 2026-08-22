import { CONFIG } from "@config";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Attach the Bearer token from localStorage. Defaults to true. */
  auth?: boolean;
  /** JSON-serializable request body. */
  body?: unknown;
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

/**
 * Thin fetch wrapper shared by every feature's API layer.
 *
 * - Prefixes CONFIG.API_BASE_URL
 * - Attaches `Authorization: Bearer <token>` unless `auth: false`
 * - Serializes/deserializes JSON automatically
 * - Throws ApiError with the backend's `message` on non-2xx responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  let finalBody: BodyInit | undefined;

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/** Fetch a binary response (e.g. a generated PDF) and return it as a Blob. */
export async function apiFetchBlob(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Blob> {
  const { auth = true, headers, body: _body, ...rest } = options;
  void _body;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = JSON.parse(await response.text());
      message = data?.message || message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
