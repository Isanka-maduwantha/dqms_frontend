import { apiFetch } from "../../../lib/api/http";

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

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role: "patient" | "admin" | "dentist" | "receptionist";
}

interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export async function loginUser(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function adminLogin(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/api/admin/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function registerUser(payload: RegisterPayload) {
  return apiFetch<{ message: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

/** Persist the session after a successful login. */
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function decodeBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

export function getUserFromToken(): { id?: string; email?: string; role?: string } | null {
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

/** Cached display info saved at login time (has `name`, unlike the raw JWT). */
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveRole(role: string): void {
  if (!role || typeof role !== "string") {
    throw new Error("A valid user role is required.");
  }

  localStorage.setItem("role", role.trim().toLowerCase());
}

export function clearToken(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.setItem("login", "false");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRole(): string | null {
  const storedRole = localStorage.getItem("role");

  if (storedRole && storedRole.trim() !== "") {
    return storedRole.trim().toLowerCase();
  }

  const user = getUserFromToken();
  if (!user || typeof user !== "object") {
    return null;
  }

  return (user as { role?: string }).role ?? null;
}

export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem("token"));
}
