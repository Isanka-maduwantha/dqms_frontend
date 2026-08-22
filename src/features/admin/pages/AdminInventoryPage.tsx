import { useCallback, useEffect, useState, type FormEvent } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import FormSelect from "../../../components/FormSelect";
import CommonButton from "../../../components/CommanButton";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError } from "../../../lib/api/http";
import { formatCurrency, formatDate } from "../../../lib/utils/format";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  updateStock,
  type CreateInventoryPayload,
} from "../services/adminApi";
import type { InventoryItem } from "../types/admin";

const CATEGORIES = [
  "ORTHODONTIC",
  "RESTORATIVE",
  "ENDODONTIC",
  "ANESTHESIA",
  "PREVENTIVE",
  "PERIODONTAL",
  "PROSTHODONTIC",
  "ORAL_SURGERY",
  "IMPRESSION",
  "GENERAL",
  "INFECTION_CONTROL",
  "OTHER",
];

const EMPTY_FORM: CreateInventoryPayload = {
  itemName: "",
  category: "GENERAL",
  description: "",
  quantity: 0,
  unit: "piece",
  reorderThreshold: 10,
  unitPrice: 0,
  expiryDate: "",
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [restocking, setRestocking] = useState<InventoryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInventoryItems({ search: search || undefined, category: category || undefined, lowStock: lowStockOnly });
      setItems(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStockOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-green-text-1">Inventory</h1>
          <p className="text-[12px] text-muted-green">
            Manage consumable stock, thresholds and pricing.
          </p>
        </div>
        <CommonButton
          label="+ Add item"
          className="text-[13px] px-4.5 py-2.5"
          containerProps={{ className: "w-auto" }}
          onClick={() => setAddOpen(true)}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-64">
          <FormInput label="Search" padding="0" placeholder="Item name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-56">
          <FormSelect label="Category" padding="0" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormSelect>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-green-text-1 pb-2.5">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card>
        {loading ? (
          <p className="text-[12px] text-muted-green">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState icon="📦" title="No inventory items found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-green border-b border-border-grey">
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Unit price</th>
                  <th className="py-2 pr-3">Expiry</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey">
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className="py-3 pr-3 font-bold text-green-text-1">{item.itemName}</td>
                    <td className="py-3 pr-3">{item.category}</td>
                    <td className="py-3 pr-3">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 pr-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 pr-3">{item.expiryDate ? formatDate(item.expiryDate) : "—"}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={!item.isActive ? "INACTIVE" : item.quantity <= item.reorderThreshold ? "LOW_STOCK" : "ACTIVE"} />
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRestocking(item)}
                          className="rounded-[8px] border border-border-grey px-3 py-1.5 text-[11px] font-semibold text-green-text-1 hover:bg-gray-50"
                        >
                          Adjust stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="rounded-[8px] border border-border-grey px-3 py-1.5 text-[11px] font-semibold text-green-text-1 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={() => void load()} />
      <EditItemModal item={editing} onClose={() => setEditing(null)} onSaved={() => void load()} />
      <RestockModal item={restocking} onClose={() => setRestocking(null)} onSaved={() => void load()} />
    </div>
  );
}

function AddItemModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<CreateInventoryPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createInventoryItem({ ...form, expiryDate: form.expiryDate || null });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Add inventory item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <FormInput label="Item name" padding="0" value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} required />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormSelect>
          <FormInput label="Unit (e.g. piece, gram)" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} required />
        </div>
        <FormInput label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div className="grid grid-cols-3 gap-4">
          <FormInput label="Quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} required />
          <FormInput label="Reorder at" type="number" min="0" value={form.reorderThreshold} onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: Number(e.target.value) }))} required />
          <FormInput label="Unit price" type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))} required />
        </div>
        <FormInput label="Expiry date (optional)" type="date" value={form.expiryDate || ""} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
        {error && (
          <p className="pt-3 text-[12px] text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="pt-4">
          <CommonButton type="submit" disabled={saving} label={saving ? "Saving…" : "Add item"} className="text-[13px] py-2.5" />
        </div>
      </form>
    </Modal>
  );
}

function EditItemModal({ item, onClose, onSaved }: { item: InventoryItem | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<InventoryItem | null>(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(item);
    setError(null);
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await updateInventoryItem(form._id, {
        itemName: form.itemName,
        category: form.category,
        description: form.description,
        unit: form.unit,
        reorderThreshold: form.reorderThreshold,
        unitPrice: form.unitPrice,
        expiryDate: form.expiryDate,
        isActive: form.isActive,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(item)} title="Edit inventory item" onClose={onClose}>
      {form && (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <FormInput label="Item name" padding="0" value={form.itemName} onChange={(e) => setForm((f) => (f ? { ...f, itemName: e.target.value } : f))} required />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Category" value={form.category} onChange={(e) => setForm((f) => (f ? { ...f, category: e.target.value } : f))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FormSelect>
            <FormInput label="Unit" value={form.unit} onChange={(e) => setForm((f) => (f ? { ...f, unit: e.target.value } : f))} required />
          </div>
          <FormInput label="Description" value={form.description || ""} onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : f))} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Reorder at" type="number" min="0" value={form.reorderThreshold} onChange={(e) => setForm((f) => (f ? { ...f, reorderThreshold: Number(e.target.value) } : f))} required />
            <FormInput label="Unit price" type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm((f) => (f ? { ...f, unitPrice: Number(e.target.value) } : f))} required />
          </div>
          <FormInput label="Expiry date" type="date" value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""} onChange={(e) => setForm((f) => (f ? { ...f, expiryDate: e.target.value } : f))} />
          <label className="flex items-center gap-2 text-[12px] text-green-text-1 pt-3">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))} />
            Active
          </label>
          {error && (
            <p className="pt-3 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="pt-4">
            <CommonButton type="submit" disabled={saving} label={saving ? "Saving…" : "Save changes"} className="text-[13px] py-2.5" />
          </div>
        </form>
      )}
    </Modal>
  );
}

function RestockModal({ item, onClose, onSaved }: { item: InventoryItem | null; onClose: () => void; onSaved: () => void }) {
  const [quantity, setQuantity] = useState("");
  const [operation, setOperation] = useState<"ADD" | "REMOVE">("ADD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity("");
    setOperation("ADD");
    setError(null);
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await updateStock(item._id, Number(quantity), operation);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(item)} title="Adjust stock" onClose={onClose} width="max-w-sm">
      {item && (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <p className="text-[12px] text-muted-green pb-3">
            {item.itemName} — currently {item.quantity} {item.unit}
          </p>
          <FormSelect label="Operation" padding="0" value={operation} onChange={(e) => setOperation(e.target.value as "ADD" | "REMOVE")}>
            <option value="ADD">Add stock</option>
            <option value="REMOVE">Remove stock</option>
          </FormSelect>
          <FormInput label="Quantity" type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          {error && (
            <p className="pt-3 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="pt-4">
            <CommonButton type="submit" disabled={saving} label={saving ? "Saving…" : "Apply"} className="text-[13px] py-2.5" />
          </div>
        </form>
      )}
    </Modal>
  );
}
