export default function FormInput({
  label,
  padding = "16px",
  type = "text",
  id,
  error,
  hint,
  icon,
  rightElement,
  className = "",
  containerClassName = "",
  required = false,
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

      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none text-sm">
            {icon}
          </span>
        )}

        <input
          type={type}
          id={id}
          required={required}
          className={`w-full bg-white/80 backdrop-blur-sm border rounded-xl py-2.5 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 shadow-sm ${
            icon ? "pl-10" : ""
          } ${rightElement ? "pr-10" : ""} ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/30"
              : "border-slate-200/90 hover:border-slate-300 focus:border-[#0E7A50] focus:ring-3 focus:ring-emerald-400/20 focus:bg-white"
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        )}
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
