import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError } from "../../../lib/api/http";
import { getInventoryItems } from "../services/dentistApi";
import type { InventoryItem } from "../types/dentist";

export default function DentistInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getInventoryItems(search || undefined);
        if (!cancelled) setItems(res.items);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load inventory.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-manrope text-2xl font-bold text-green-text-1">Inventory</h1>
        <p className="text-[12px] text-muted-green">
          Reference view of current consumable stock. Editing is managed by an admin.
        </p>
      </div>

      <FormInput
        label="Search item"
        padding="0"
        placeholder="e.g. Metal Bracket"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                  <th className="py-2 pr-3">Status</th>
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
                    <td className="py-3 pr-3">
                      <StatusBadge status={item.quantity <= item.reorderThreshold ? "LOW_STOCK" : "ACTIVE"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
