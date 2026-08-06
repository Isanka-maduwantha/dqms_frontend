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

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(
    CONFIG?.LOGIN_API_URL || "http://localhost:3000/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return response;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(
    CONFIG?.REGISTER_API_URL || "http://localhost:3000/api/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return response;
}

function decodeBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  return atob(padded);
}

export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = decodeBase64Url(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse token", error);
    return null;
  }
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getRole() {
  const user = getUserFromToken();
  if (!user || typeof user !== "object") {
    console.log("Token error");
    return null;
  }

  return (user as { role?: string }).role ?? null;
}
