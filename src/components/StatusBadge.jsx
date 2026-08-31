import { titleCase } from "../lib/utils/format";

const CONFIGS = {
  BOOKED: {
    classes: "bg-emerald-500/10 text-emerald-800 border-emerald-200/80",
    dot: "bg-emerald-600",
    icon: "📅",
  },
  ARRIVED: {
    classes: "bg-amber-500/10 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500 animate-pulse",
    icon: "🪑",
  },
  IN_CONSULTATION: {
    classes: "bg-teal-600/10 text-teal-900 border-teal-300/80",
    dot: "bg-teal-600 animate-pulse",
    icon: "🩺",
  },
  COMPLETED: {
    classes: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
    icon: "✓",
  },
  CANCELLED: {
    classes: "bg-rose-500/10 text-rose-700 border-rose-200/80",
    dot: "bg-rose-500",
    icon: "✕",
  },
  UNPAID: {
    classes: "bg-rose-500/10 text-rose-700 border-rose-200/80",
    dot: "bg-rose-500",
    icon: "💳",
  },
  PARTIALLY_PAID: {
    classes: "bg-amber-500/10 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
    icon: "⏳",
  },
  PAID: {
    classes: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
    icon: "✓",
  },
  LOW_STOCK: {
    classes: "bg-rose-500/15 text-rose-700 border-rose-300 font-bold animate-pulse",
    dot: "bg-rose-500",
    icon: "⚠️",
  },
  ACTIVE: {
    classes: "bg-teal-500/10 text-teal-800 border-teal-200/80",
    dot: "bg-teal-500",
    icon: "●",
  },
  INACTIVE: {
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    icon: "○",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const key = String(status || "").toUpperCase();
  const config = CONFIGS[key] || {
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    icon: "•",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border backdrop-blur-sm shadow-xs whitespace-nowrap transition-colors ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{titleCase(status || "Unknown")}</span>
    </span>
  );
}
