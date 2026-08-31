export default function CommonButton({
  label,
  children,
  containerProps,
  className = "",
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  const { className: containerClassName = "", ...restContainerProps } =
    containerProps || {};

  const variants = {
    primary:
      "glossy-gradient-btn text-white shadow-md shadow-emerald-700/25 border border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-700/35",
    secondary:
      "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/90 shadow-sm hover:shadow hover:text-[#0E7A50] backdrop-blur-md",
    danger:
      "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white shadow-md shadow-rose-600/20 border border-rose-400/30",
    success:
      "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-600/20 border border-emerald-400/30",
    outline:
      "border-2 border-[#0E7A50] text-[#0E7A50] hover:bg-emerald-50/70 active:bg-emerald-100 font-bold",
    ghost:
      "text-slate-600 hover:bg-slate-100/70 hover:text-[#0E7A50]",
  };

  const currentVariantClass = variants[variant] || variants.primary;

  return (
    <div
      className={`btn-cont justify-center items-center flex w-full ${containerClassName}`.trim()}
      {...restContainerProps}
    >
      <button
        disabled={disabled || loading}
        className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-bold text-xs sm:text-sm px-4 py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer ${currentVariantClass} ${className}`.trim()}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>{typeof loading === "string" ? loading : "Processing…"}</span>
          </>
        ) : (
          <>
            {icon && <span className="text-base leading-none">{icon}</span>}
            {children ?? label}
          </>
        )}
      </button>
    </div>
  );
}
