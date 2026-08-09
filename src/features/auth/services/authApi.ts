import { CONFIG } from "@config";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
}

interface JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(
    CONFIG?.LOGIN_API_URL ||
      "http://localhost:3000/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return response;
}

export async function registerUser(
  payload: RegisterPayload,
) {
  const response = await fetch(
    CONFIG?.REGISTER_API_URL ||
      "http://localhost:3000/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return response;
}

function decodeBase64Url(
  base64Url: string,
): string {
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding =
    (4 - (base64.length % 4)) % 4;

  const padded = base64.padEnd(
    base64.length + padding,
    "=",
  );

  return atob(padded);
}

export function getUserFromToken(): JwtPayload | null {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {
      return null;
    }

    const decoded = decodeBase64Url(tokenParts[1]);

    const payload: unknown = JSON.parse(decoded);

    if (
      typeof payload !== "object" ||
      payload === null
    ) {
      return null;
    }

    return payload as JwtPayload;
  } catch (error) {
    console.error(
      "Failed to parse authentication token:",
      error,
    );

    return null;
  }
}

export function saveToken(token: string): void {
  if (!token || typeof token !== "string") {
    throw new Error(
      "A valid authentication token is required.",
    );
  }

  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRole(): string | null {
  const user = getUserFromToken();

  if (!user) {
    return null;
  }

  if (
    typeof user.role !== "string" ||
    user.role.trim() === ""
  ) {
    return null;
  }

  return user.role.trim().toLowerCase();
}