import { apiFetch } from "../../../lib/api/http";

export function getMyProfile() {
  return apiFetch("/api/profile/me");
}

export function updateMyProfile(payload) {
  return apiFetch("/api/profile/me", {
    method: "PUT",
    body: payload,
  });
}

export function changeMyPassword(payload) {
  return apiFetch("/api/profile/me/change-password", {
    method: "POST",
    body: payload,
  });
}
