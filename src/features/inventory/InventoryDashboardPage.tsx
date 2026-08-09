import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxesStacked, faPlus, faRotate, faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import { getRole } from "../auth/services/authApi";
import { createItem, deleteItem, getItems, restockItem, updateItem } from "./services/inventoryApi";
import type { InventoryItem } from "./types/inventory";

const card = "bg-white border border-border-grey rounded-[14px] p-5";

export default function InventoryDashboardPage() {
  const isAdmin = getRole() === "admin";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [creating, setCreating] = useState(false);

  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const showError = (err: unknown) =>
    setBanner({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });

  // Used by the create/delete/restock handlers below to re-pull the table after a mutation.
  async function refresh() {
    try {
      const res = await getItems();
      setItems(res.items);
    } catch (err) {
      showError(err);
    }
  }

  // Mount-only fetch, written as a promise chain (rather than calling the async `refresh`
  // above) so state is only ever set once the request has actually resolved.
  useEffect(() => {
    getItems()
      .then((res) => setItems(res.items))
      .catch((err) => showError(err))
      .finally(() => setLoading(false));
  }, []);

  // F-8.3
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setBanner(null);
    try {
      await createItem({ itemName, category, unitPrice, quantity, lowStockThreshold });
      setItemName("");
      setCategory("");
      setUnitPrice(0);
      setQuantity(0);
      setLowStockThreshold(10);
      await refresh();
      setBanner({ type: "success", text: "Item added" });
    } catch (err) {
      showError(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inventory item?")) return;
    setBusyId(id);
    try {
      await deleteItem(id);
      await refresh();
    } catch (err) {
      showError(err);
    } finally {
      setBusyId(null);
    }
  }

  async function handlePriceEdit(item: InventoryItem) {
    const next = prompt("New unit price:", String(item.unitPrice));
    if (next === null) return;
    setBusyId(item._id);
    try {
      await updateItem(item._id, { unitPrice: Number(next) });
      await refresh();
    } catch (err) {
      showError(err);
    } finally {
      setBusyId(null);
    }
  }

  // F-8.1 is automatic (see dentist module); this is the manual restock action
  async function handleRestock(item: InventoryItem) {
    const amount = restockAmounts[item._id] || 0;
    if (amount <= 0) return;
    setBusyId(item._id);
    try {
      await restockItem(item._id, amount);
      setRestockAmounts((prev) => ({ ...prev, [item._id]: 0 }));
      await refresh();
      setBanner({ type: "success", text: `${item.itemName} restocked by ${amount}` });
    } catch (err) {
      showError(err);
    } finally {
      setBusyId(null);
    }
  }

  const lowStockItems = items.filter((i) => i.isLowStock ?? i.quantity <= i.lowStockThreshold);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 font-inter text-green-text-1">
      <h1 className="font-manrope font-extrabold text-2xl mb-1">Inventory &amp; Stock Management</h1>
      <p className="text-muted-green text-[13px] mb-6">Module 8 — materials, PPE, and consumables</p>

      {banner && (
        <div
          className={`mb-5 rounded-[10px] px-4 py-3 text-[13px] ${
            banner.type === "success" ? "bg-border-grey/60 text-green-text-1" : "bg-red-100 text-red-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* F-8.2 */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-[10px] p-4 text-[13px] text-red-700">
          <p className="font-bold flex items-center gap-2 mb-1">
            <FontAwesomeIcon icon={faTriangleExclamation} /> Low stock warning
          </p>
          {lowStockItems.map((i) => (
            <span key={i._id} className="inline-block mr-3">
              {i.itemName} ({i.quantity} left)
            </span>
          ))}
        </div>
      )}

      {isAdmin && (
        <section className={`${card} mb-6`}>
          <h2 className="font-manrope font-bold text-[15px] flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Add Inventory Item
          </h2>
          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="col-span-2">
              <label className="font-inter text-[12px] font-bold">Item name</label>
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="mt-1 w-full p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>
            <div>
              <label className="font-inter text-[12px] font-bold">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>
            <div>
              <label className="font-inter text-[12px] font-bold">Unit price</label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                required
                className="mt-1 w-full p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>
            <div>
              <label className="font-inter text-[12px] font-bold">Quantity</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>
            <div>
              <label className="font-inter text-[12px] font-bold">Low-stock threshold</label>
              <input
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="mt-1 w-full p-2 outline-none bg-white border border-border-grey rounded-[10px] text-[13px]"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-accent text-white rounded-[10px] px-4 py-2.5 text-[13px] disabled:opacity-60 col-span-2 md:col-span-1"
            >
              {creating ? "Adding…" : "Add Item"}
            </button>
          </form>
        </section>
      )}

      <section className={card}>
        <h2 className="font-manrope font-bold text-[15px] flex items-center gap-2">
          <FontAwesomeIcon icon={faBoxesStacked} /> Stock
        </h2>

        {loading && <p className="text-muted-green text-[13px] mt-3">Loading…</p>}

        {!loading && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="text-left text-muted-green border-b border-border-grey">
                  <th className="py-2">Item</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2">Status</th>
                  {isAdmin && <th className="py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const low = item.isLowStock ?? item.quantity <= item.lowStockThreshold;
                  return (
                    <tr key={item._id} className="border-b border-border-grey/60">
                      <td className="py-2 font-bold">{item.itemName}</td>
                      <td className="py-2 text-muted-green">{item.category}</td>
                      <td className="py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${low ? "bg-red-100 text-red-700" : "bg-border-grey/60"}`}>
                          {low ? "Low stock" : "OK"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="number"
                              min={1}
                              placeholder="Qty"
                              value={restockAmounts[item._id] ?? ""}
                              onChange={(e) =>
                                setRestockAmounts((prev) => ({ ...prev, [item._id]: Number(e.target.value) }))
                              }
                              className="w-16 p-1.5 outline-none bg-white border border-border-grey rounded-[8px] text-[12px]"
                            />
                            <button
                              onClick={() => handleRestock(item)}
                              disabled={busyId === item._id}
                              title="Restock"
                              className="text-accent px-1"
                            >
                              <FontAwesomeIcon icon={faRotate} />
                            </button>
                            <button onClick={() => handlePriceEdit(item)} className="text-[11px] underline text-muted-green">
                              Edit price
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={busyId === item._id}
                              title="Delete"
                              className="text-red-500 px-1"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length === 0 && <p className="text-muted-green text-[13px] mt-4">No inventory items yet.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
