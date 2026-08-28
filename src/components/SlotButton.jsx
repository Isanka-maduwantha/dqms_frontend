export default function SlotButton({
  label,
  selected = false,
  available = true,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      disabled={!available}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? "glossy-gradient-btn text-white shadow-md shadow-blue-500/30 border-blue-400/50 scale-[1.02]"
          : available
          ? "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 border-slate-200/90 hover:border-blue-300 hover:shadow-sm"
          : "bg-slate-100/60 text-slate-400 border-slate-200/50"
      } ${className}`}
      {...props}
    >
      <span className="text-[10px] opacity-75">⏰</span>
      <span>{label}</span>
    </button>
  );
}
