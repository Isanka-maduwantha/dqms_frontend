import { apiFetch, apiFetchBlob } from "../../../lib/api/http";
// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export function getNotifications(unreadOnly = false) {
    const qs = unreadOnly ? "?unreadOnly=true" : "";
    return apiFetch(`/api/admin/notifications${qs}`);
}
export function getUnreadCount() {
    return apiFetch("/api/admin/notifications/unread-count");
}
export function markNotificationRead(notificationId) {
    return apiFetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "PATCH",
    });
}
export function markAllNotificationsRead() {
    return apiFetch("/api/admin/notifications/read-all", {
        method: "PATCH",
    });
}
export function getInventoryItems(query = {}) {
    const params = new URLSearchParams();
    if (query.category)
        params.set("category", query.category);
    if (query.search)
        params.set("search", query.search);
    if (query.lowStock)
        params.set("lowStock", "true");
    if (query.includeInactive)
        params.set("includeInactive", "true");
    const qs = params.toString();
    return apiFetch(`/api/inventory/items${qs ? `?${qs}` : ""}`);
}
export function createInventoryItem(payload) {
    return apiFetch("/api/inventory/items", { method: "POST", body: payload });
}
export function updateInventoryItem(itemId, payload) {
    return apiFetch(`/api/inventory/items/${itemId}`, { method: "PUT", body: payload });
}
export function updateStock(itemId, quantity, operation) {
    return apiFetch(`/api/inventory/items/${itemId}/stock`, { method: "PATCH", body: { quantity, operation } });
}
function buildQuery(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value)
            params.set(key, String(value));
    });
    return params.toString();
}
export function getReport(type, filters = {}) {
    const qs = buildQuery(filters);
    return apiFetch(`/api/admin/reports/${type}${qs ? `?${qs}` : ""}`);
}
export async function downloadReportPdf(type, filters = {}) {
    const params = buildQuery(filters);
    const qs = `type=${type}${params ? `&${params}` : ""}`;
    return apiFetchBlob(`/api/admin/reports/export/pdf?${qs}`);
}
