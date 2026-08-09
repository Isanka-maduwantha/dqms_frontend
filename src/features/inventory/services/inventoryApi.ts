import { apiFetch } from "../../../lib/utils/apiFetch";
import type { CreateInventoryItemPayload, InventoryItem, UpdateInventoryItemPayload } from "../types/inventory";

// F-8.3: Inventory Item Management (CRUD)
export async function getItems() {
  return apiFetch<{ success: boolean; count: number; items: InventoryItem[] }>("/inventory/items");
}

export async function getItem(id: string) {
  return apiFetch<{ success: boolean; item: InventoryItem }>(`/inventory/items/${id}`);
}

export async function createItem(payload: CreateInventoryItemPayload) {
  return apiFetch<{ success: boolean; item: InventoryItem }>("/inventory/items", {
    method: "POST",
    body: payload,
  });
}

export async function updateItem(id: string, payload: UpdateInventoryItemPayload) {
  return apiFetch<{ success: boolean; item: InventoryItem }>(`/inventory/items/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteItem(id: string) {
  return apiFetch<{ success: boolean; message: string }>(`/inventory/items/${id}`, { method: "DELETE" });
}

export async function restockItem(id: string, quantity: number) {
  return apiFetch<{ success: boolean; item: InventoryItem }>(`/inventory/items/${id}/restock`, {
    method: "PATCH",
    body: { quantity },
  });
}

// F-8.2: Low-Stock Warning Alert
export async function getLowStockItems() {
  return apiFetch<{ success: boolean; count: number; items: InventoryItem[] }>("/inventory/items/low-stock");
}
