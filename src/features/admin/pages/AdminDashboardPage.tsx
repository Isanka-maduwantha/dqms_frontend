import { useCallback, useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import { ApiError } from "../../../lib/api/http";
import { formatDateTime } from "../../../lib/utils/format";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/adminApi";
import type { AdminNotification } from "../types/admin";

export default function AdminDashboardPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async (unreadOnly: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(unreadOnly);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter === "unread");
  }, [filter, load]);

  const handleMarkRead = async (id: string) => {
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
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-green-text-1">
            Notifications
          </h1>
          <p className="text-[12px] text-muted-green">
            Low-stock alerts raised by the inventory system.{" "}
            {unreadCount > 0 && <span className="font-bold text-accent">{unreadCount} unread</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border-grey rounded-[10px] overflow-hidden text-[12px]">
            {(["all", "unread"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-4 py-2 font-semibold capitalize ${
                  filter === key ? "bg-accent text-white" : "bg-white text-green-text-1"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            className="rounded-[10px] border border-border-grey px-4 py-2 text-[12px] font-semibold text-green-text-1 hover:bg-gray-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <p className="text-[12px] text-muted-green">Loading…</p>
      ) : notifications.length === 0 ? (
        <EmptyState icon="✅" title="You're all caught up" description="No notifications to show." />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`flex justify-between items-start gap-4 ${!n.isRead ? "border-accent/30 bg-accent/5" : ""}`}
            >
              <div>
                <p className="font-bold text-green-text-1 text-[13px]">{n.title}</p>
                <p className="text-[12px] text-muted-green pt-1">{n.message}</p>
                <p className="text-[11px] text-muted-green pt-1.5">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n._id)}
                  className="shrink-0 rounded-[8px] border border-border-grey px-3 py-1.5 text-[11px] font-semibold text-green-text-1 hover:bg-white"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
