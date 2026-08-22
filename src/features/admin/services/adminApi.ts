import { apiFetch, apiFetchBlob } from "../../../lib/api/http";
import type { AdminNotification, InventoryItem, ReportEnvelope, ReportType } from "../types/admin";

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function getNotifications(unreadOnly = false) {
  const qs = unreadOnly ? "?unreadOnly=true" : "";
  return apiFetch<{ success: boolean; count: number; unreadCount: number; notifications: AdminNotification[] }>(
    `/api/admin/notifications${qs}`,
  );
}

export function getUnreadCount() {
  return apiFetch<{ success: boolean; unreadCount: number }>("/api/admin/notifications/unread-count");
}

export function markNotificationRead(notificationId: string) {
  return apiFetch<{ success: boolean }>(`/api/admin/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ success: boolean; modifiedCount: number }>("/api/admin/notifications/read-all", {
    method: "PATCH",
  });
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface InventoryQuery {
  category?: string;
  search?: string;
  lowStock?: boolean;
  includeInactive?: boolean;
}

export function getInventoryItems(query: InventoryQuery = {}) {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.lowStock) params.set("lowStock", "true");
  if (query.includeInactive) params.set("includeInactive", "true");
  const qs = params.toString();
  return apiFetch<{ success: boolean; count: number; items: InventoryItem[] }>(
    `/api/inventory/items${qs ? `?${qs}` : ""}`,
  );
}

export interface CreateInventoryPayload {
  itemName: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  unitPrice: number;
  expiryDate?: string | null;
}

export function createInventoryItem(payload: CreateInventoryPayload) {
  return apiFetch<{ success: boolean; message: string; item: InventoryItem }>(
    "/api/inventory/items",
    { method: "POST", body: payload },
  );
}

export function updateInventoryItem(itemId: string, payload: Partial<CreateInventoryPayload> & { isActive?: boolean }) {
  return apiFetch<{ success: boolean; message: string; item: InventoryItem }>(
    `/api/inventory/items/${itemId}`,
    { method: "PUT", body: payload },
  );
}

export function updateStock(itemId: string, quantity: number, operation: "ADD" | "REMOVE") {
  return apiFetch<{ success: boolean; message: string; item: InventoryItem }>(
    `/api/inventory/items/${itemId}/stock`,
    { method: "PATCH", body: { quantity, operation } },
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface ReportFilters {
  period?: "day" | "week" | "month";
  date?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  doctorId?: string;
  status?: string;
  visitPurpose?: string;
}

function buildQuery(filters: ReportFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  return params.toString();
}

export function getReport<TSummary = unknown, TData = unknown>(
  type: ReportType,
  filters: ReportFilters = {},
) {
  const qs = buildQuery(filters);
  return apiFetch<ReportEnvelope<TSummary, TData>>(
    `/api/admin/reports/${type}${qs ? `?${qs}` : ""}`,
  );
}

export async function downloadReportPdf(type: ReportType, filters: ReportFilters = {}) {
  const params = buildQuery(filters);
  const qs = `type=${type}${params ? `&${params}` : ""}`;
  return apiFetchBlob(`/api/admin/reports/export/pdf?${qs}`);
}
