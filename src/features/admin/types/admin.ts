export interface AdminNotification {
  _id: string;
  isRead: boolean;
  recipientId: string;
  type: "LOW_STOCK";
  inventoryItemId: { _id: string; itemName: string; category: string; quantity: number; unit: string; reorderThreshold: number; isActive: boolean } | string;
  title: string;
  message: string;
  currentQuantity: number;
  reorderThreshold: number;
  itemName: string;
  unit: string;
  createdAt: string;
  readAt: string | null;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
  unitPrice: number;
  expiryDate: string | null;
  isActive: boolean;
}

export type ReportType = "inventory" | "treatments" | "revenue" | "payments" | "appointments";

export interface ReportEnvelope<TSummary, TData> {
  success: boolean;
  report: { id: string; reportType: string; title: string; generatedAt: string };
  filters: Record<string, unknown>;
  summary: TSummary;
  data: TData;
}
