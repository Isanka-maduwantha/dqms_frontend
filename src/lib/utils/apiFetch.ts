import { CONFIG } from "@config";

// Shared authenticated fetch helper for Modules 6/7/8 (dentist, billing, inventory),
// which all require the JWT issued at login (see features/auth/services/authApi.ts).

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Set when body is a FormData instance (file uploads) so we skip the JSON Content-Type. */
  isForm?: boolean;
}

/** Calls `${API_BASE_URL}${path}`, attaches the bearer token, and parses the JSON response. */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, isForm, headers, ...rest } = options;
  const token = getToken();

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/** Same as apiFetch, but returns a Blob — used for downloading PDF receipts (F-7.1). */
export async function apiFetchBlob(path: string, options: ApiFetchOptions = {}): Promise<Blob> {
  const { body, isForm, headers, ...rest } = options;
  const token = getToken();

  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status, null);
  }

  return response.blob();
}
