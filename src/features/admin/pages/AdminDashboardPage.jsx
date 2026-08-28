import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import CommonButton from "../../../components/CommanButton";
import { ApiError } from "../../../lib/api/http";
import { formatDateTime } from "../../../lib/utils/format";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/adminApi";

export default function AdminDashboardPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (unreadOnly) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(unreadOnly);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter === "unread");
  }, [filter, load]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      void load(filter === "unread");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update notification.");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      void load(filter === "unread");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update notifications.");
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            System Alerts
          </span>
          <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Clinic Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time automated alerts for consumable stock reorders and system notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["all", "unread"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === key
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {key === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : key}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 shadow-xs transition-colors"
            >
              ✓ Mark All Read
            </button>
          )}
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <p className="text-xs text-slate-500 py-12 text-center">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All caught up!"
          description="There are no system notifications or low-stock alerts at this moment."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                !n.isRead
                  ? "border-blue-300 bg-blue-50/40 shadow-sm"
                  : "border-white/80 bg-white/70"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                    !n.isRead
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {n.title.toLowerCase().includes("stock") ? "📦" : "🔔"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n._id)}
                  className="self-end sm:self-center shrink-0 rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition-colors cursor-pointer"
                >
                  Mark as Read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
