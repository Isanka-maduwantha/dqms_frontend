export default function Card({
  className = "",
  interactive = false,
  dark = false,
  children,
  ...props
}) {
  return (
    <div
      className={`glass-card p-6 sm:p-7 ${
        interactive ? "glass-card-interactive cursor-pointer" : ""
      } ${dark ? "glass-card-dark text-white" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
