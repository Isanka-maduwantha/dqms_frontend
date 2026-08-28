import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import FormInput from "../../../components/FormInput";
import StatusBadge from "../../../components/StatusBadge";
import { ApiError } from "../../../lib/api/http";
import { getInventoryItems } from "../services/dentistApi";

export default function DentistInventoryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getInventoryItems(search || undefined);
        if (!cancelled) setItems(res.items || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load inventory items.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div className="space-y-6 text-left max-w-5xl">
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Stock Reference
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Clinical Consumables Stock
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time reference view of available clinical materials and medication stock.
        </p>
      </div>

      <div className="max-w-md">
        <FormInput
          label="Search Inventory Stock"
          padding="0"
          placeholder="e.g. Composite Resin, Dental Needle…"
          value={search}
          icon="🔍"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="p-0 overflow-hidden border border-white/80">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-xs text-slate-700">
            {items.length} Tracked Consumable Items
          </span>
          <span className="text-xs text-slate-500">Stock updates live with treatments</span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-12 text-center">Loading stock reference…</p>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="📦"
              title="No items found"
              description="No clinical consumables match your search query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 px-6 font-bold">Consumable Item</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Current Stock</th>
                  <th className="py-3 px-6 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                        📦
                      </span>
                      <span>{item.itemName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <StatusBadge
                        status={
                          item.quantity <= item.reorderThreshold ? "LOW_STOCK" : "ACTIVE"
                        }
                      />
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
