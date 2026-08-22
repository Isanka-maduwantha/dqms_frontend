export interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lowStockThreshold: number;
  lastUpdatedStock: string;
  isLowStock?: boolean;
}

export interface CreateInventoryItemPayload {
  itemName: string;
  category?: string;
  unitPrice: number;
  quantity?: number;
  lowStockThreshold?: number;
}

export interface UpdateInventoryItemPayload {
  itemName?: string;
  category?: string;
  unitPrice?: number;
  lowStockThreshold?: number;
}
