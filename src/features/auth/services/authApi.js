import { apiFetch } from "../../../lib/api/http";
export async function loginUser(payload) {
    return apiFetch("/api/auth/login", {
        method: "POST",
        body: payload,
        auth: false,
    });
}
export async function adminLogin(payload) {
    return apiFetch("/api/admin/login", {
        method: "POST",
        body: payload,
        auth: false,
    });
}
export async function registerUser(payload) {
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: payload,
        auth: false,
    });
}
/** Persist the session after a successful login. */
export function saveSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}
export function saveToken(token) {
    localStorage.setItem("token", token);
}
export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
function decodeBase64Url(base64Url) {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return atob(padded);
}
export function getUserFromToken() {
    const token = localStorage.getItem("token");
    if (!token)
        return null;
    try {
        const payload = token.split(".")[1];
        const decoded = decodeBase64Url(payload);
        return JSON.parse(decoded);
    }
    catch (error) {
        console.error("Failed to parse token", error);
        return null;
    }
}
/** Cached display info saved at login time (has `name`, unlike the raw JWT). */
export function getStoredUser() {
    const raw = localStorage.getItem("user");
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function getRole() {
    const user = getUserFromToken();
    if (!user || typeof user !== "object") {
        return null;
    }
    return user.role ?? null;
}
export function isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
}
