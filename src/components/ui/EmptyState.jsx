export default function EmptyState({
  icon = "📭",
  title = "No data found",
  description = "",
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white/40 border border-dashed border-slate-200 backdrop-blur-xs my-2 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-200/50 flex items-center justify-center text-2xl mb-3 shadow-xs">
        <span>{icon}</span>
      </div>
      <h4 className="font-manrope font-bold text-base text-slate-800 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
