import { titleCase } from "../lib/utils/format";

const STYLES: Record<string, string> = {
  BOOKED: "bg-blue-50 text-blue-700",
  ARRIVED: "bg-amber-50 text-amber-700",
  IN_CONSULTATION: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-accent/10 text-accent",
  CANCELLED: "bg-red-50 text-red-600",

  UNPAID: "bg-red-50 text-red-600",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  PAID: "bg-accent/10 text-accent",

  LOW_STOCK: "bg-red-50 text-red-600",
  ACTIVE: "bg-accent/10 text-accent",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export default function StatusBadge({ status }: { status: string | undefined | null }) {
  const key = String(status || "").toUpperCase();
  const style = STYLES[key] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${style}`}
    >
      {titleCase(status || "Unknown")}
    </span>
  );
}
