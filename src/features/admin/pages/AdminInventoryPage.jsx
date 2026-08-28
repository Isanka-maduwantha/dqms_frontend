import { useCallback, useEffect, useState } from "react";
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
} from "../services/adminApi";

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

const EMPTY_FORM = {
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
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restocking, setRestocking] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInventoryItems({
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStockOnly,
      });
      setItems(res.items || []);
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
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Clinical Supply Chain
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Consumables & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage stock levels, automated reorder triggers, and procedure material unit prices.
          </p>
        </div>

        <CommonButton
          label="+ Add Inventory Item"
          className="px-5 py-2.5 text-xs sm:text-sm shadow-md"
          containerProps={{ className: "w-auto" }}
          onClick={() => setAddOpen(true)}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap gap-4 items-end bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-64">
          <FormInput
            label="Search Item"
            padding="0"
            placeholder="Search by item name…"
            value={search}
            icon="🔍"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <FormSelect
            label="Filter Category"
            padding="0"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </FormSelect>
        </div>

        <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 pb-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-rose-600">⚠️ Low Stock Alerts Only</span>
        </label>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Inventory Table Card */}
      <Card className="p-0 overflow-hidden border border-white/80">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-xs text-slate-700">
            {items.length} Tracked Consumable Items
          </span>
          <span className="text-xs text-slate-500">Threshold alerts are sent to admins</span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-12 text-center">Loading inventory…</p>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="📦"
              title="No items found"
              description="No inventory items match your filter criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 px-6 font-bold">Item Details</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Stock on Hand</th>
                  <th className="py-3 px-4 font-bold">Unit Price</th>
                  <th className="py-3 px-4 font-bold">Expiry Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                        📦
                      </div>
                      <div>
                        <div>{item.itemName}</div>
                        {item.description && (
                          <div className="text-[11px] font-normal text-slate-500 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.expiryDate ? formatDate(item.expiryDate) : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={
                          !item.isActive
                            ? "INACTIVE"
                            : item.quantity <= item.reorderThreshold
                            ? "LOW_STOCK"
                            : "ACTIVE"
                        }
                      />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRestocking(item)}
                          className="rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          ⚡ Adjust Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          ✏️ Edit
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

      {/* Modals */}
      <AddItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => void load()}
      />
      <EditItemModal
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => void load()}
      />
      <RestockModal
        item={restocking}
        onClose={() => setRestocking(null)}
        onSaved={() => void load()}
      />
    </div>
  );
}

function AddItemModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createInventoryItem({
        ...form,
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        reorderThreshold: Number(form.reorderThreshold),
        unitPrice: Number(form.unitPrice),
        expiryDate: form.expiryDate || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create inventory item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Add Clinical Consumable Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        {error && <Alert kind="error">{error}</Alert>}

        <FormInput
          label="Item Name"
          padding="0"
          placeholder="e.g. Disposable Dental Needles (30G)"
          value={form.itemName}
          onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
          required
        />

        <div className="grid sm:grid-cols-2 gap-3.5">
          <FormSelect
            label="Item Category"
            padding="0"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </FormSelect>

          <FormInput
            label="Unit of Measure"
            padding="0"
            placeholder="e.g. piece, box, ml, g"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            required
          />
        </div>

        <FormInput
          label="Description / Specification (Optional)"
          padding="0"
          placeholder="e.g. 100 pcs per sterile packaging box"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Initial Stock"
            padding="0"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
            required
          />

          <FormInput
            label="Reorder Alert"
            padding="0"
            type="number"
            min="0"
            value={form.reorderThreshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, reorderThreshold: Number(e.target.value) }))
            }
            required
          />

          <FormInput
            label="Unit Price (LKR)"
            padding="0"
            type="number"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))
            }
            required
          />
        </div>

        <FormInput
          label="Expiry Date (Optional)"
          padding="0"
          type="date"
          value={form.expiryDate || ""}
          onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
        />

        <div className="pt-3 border-t border-slate-100">
          <CommonButton
            type="submit"
            disabled={saving}
            loading={saving ? "Adding item…" : false}
            label="Save Inventory Item"
            className="w-full py-2.5"
          />
        </div>
      </form>
    </Modal>
  );
}

function EditItemModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(item);
    setError(null);
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setError(null);
    try {
      await updateInventoryItem(form._id, {
        itemName: form.itemName.trim(),
        category: form.category,
        description: form.description ? form.description.trim() : "",
        unit: form.unit,
        reorderThreshold: Number(form.reorderThreshold),
        unitPrice: Number(form.unitPrice),
        expiryDate: form.expiryDate || null,
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
    <Modal open={Boolean(item)} title="Edit Inventory Details" onClose={onClose}>
      {form && (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {error && <Alert kind="error">{error}</Alert>}

          <FormInput
            label="Item Name"
            padding="0"
            value={form.itemName}
            onChange={(e) => setForm((f) => (f ? { ...f, itemName: e.target.value } : f))}
            required
          />

          <div className="grid sm:grid-cols-2 gap-3.5">
            <FormSelect
              label="Item Category"
              padding="0"
              value={form.category}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, category: e.target.value } : f))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </FormSelect>

            <FormInput
              label="Unit"
              padding="0"
              value={form.unit}
              onChange={(e) => setForm((f) => (f ? { ...f, unit: e.target.value } : f))}
              required
            />
          </div>

          <FormInput
            label="Description (Optional)"
            padding="0"
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, description: e.target.value } : f))
            }
          />

          <div className="grid sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Reorder Alert Threshold"
              padding="0"
              type="number"
              min="0"
              value={form.reorderThreshold}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, reorderThreshold: Number(e.target.value) } : f
                )
              }
              required
            />

            <FormInput
              label="Unit Price (LKR)"
              padding="0"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, unitPrice: Number(e.target.value) } : f))
              }
              required
            />
          </div>

          <FormInput
            label="Expiry Date"
            padding="0"
            type="date"
            value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, expiryDate: e.target.value } : f))
            }
          />

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))
              }
              className="rounded border-slate-300 text-blue-600"
            />
            <span>Active in Procedure Catalogue</span>
          </label>

          <div className="pt-3 border-t border-slate-100">
            <CommonButton
              type="submit"
              disabled={saving}
              loading={saving ? "Saving changes…" : false}
              label="Save Item Details"
              className="w-full py-2.5"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}

function RestockModal({ item, onClose, onSaved }) {
  const [quantity, setQuantity] = useState("");
  const [operation, setOperation] = useState("ADD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setQuantity("");
    setOperation("ADD");
    setError(null);
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;

    const num = Number(quantity);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a positive adjustment quantity.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateStock(item._id, num, operation);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={Boolean(item)} title="Adjust Stock Quantity" onClose={onClose} width="max-w-md">
      {item && (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs">
            <div className="font-bold text-slate-900">{item.itemName}</div>
            <div className="text-slate-600 mt-0.5">
              Current Available Stock:{" "}
              <span className="font-extrabold text-blue-700">
                {item.quantity} {item.unit}
              </span>
            </div>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <FormSelect
            label="Adjustment Operation"
            padding="0"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="ADD">➕ Add Stock (New Delivery / Restock)</option>
            <option value="REMOVE">➖ Remove Stock (Damaged / Disposed)</option>
          </FormSelect>

          <FormInput
            label="Adjustment Quantity"
            padding="0"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-slate-100">
            <CommonButton
              type="submit"
              disabled={saving}
              loading={saving ? "Applying adjustment…" : false}
              label="Apply Stock Change"
              className="w-full py-2.5"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
