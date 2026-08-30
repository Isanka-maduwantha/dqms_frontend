const STYLES = {
  error: {
    container: "bg-rose-500/10 text-rose-800 border-rose-200/90 shadow-rose-500/5",
    icon: "⚠️",
    badge: "Error",
  },
  success: {
    container: "bg-emerald-500/10 text-emerald-800 border-emerald-200/90 shadow-emerald-500/5",
    icon: "✓",
    badge: "Success",
  },
  info: {
    container: "bg-blue-500/10 text-blue-800 border-blue-200/90 shadow-blue-500/5",
    icon: "ℹ️",
    badge: "Notice",
  },
  warning: {
    container: "bg-amber-500/10 text-amber-800 border-amber-200/90 shadow-amber-500/5",
    icon: "⚡",
    badge: "Warning",
  },
};

export default function Alert({ kind = "info", title, children, className = "" }) {
  const current = STYLES[kind] || STYLES.info;

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-2xl border p-4 text-xs font-semibold backdrop-blur-md shadow-sm transition-all duration-200 flex items-start gap-3 animate-fadeIn ${current.container} ${className}`}
    >
      <span className="text-base shrink-0 mt-0.5">{current.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold text-sm mb-0.5">{title}</div>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
