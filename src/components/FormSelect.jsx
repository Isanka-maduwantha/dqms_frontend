export default function FormSelect({
  label,
  padding = "16px",
  id,
  children,
  error,
  hint,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div
      className={`flex flex-col w-full text-left transition-all ${containerClassName}`}
      style={{ paddingTop: padding }}
    >
      {label && (
        <label
          className="font-inter text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between"
          htmlFor={id}
        >
          <span>
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          required={required}
          className={`w-full appearance-none bg-white/80 backdrop-blur-sm border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-slate-800 outline-none transition-all duration-200 shadow-sm cursor-pointer ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/30"
              : "border-slate-200/90 hover:border-slate-300 focus:border-[#0E7A50] focus:ring-3 focus:ring-emerald-400/20 focus:bg-white"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-fadeIn">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
