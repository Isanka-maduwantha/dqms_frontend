import type { ReactNode } from "react";

interface AlertProps {
  kind?: "error" | "success" | "info";
  children: ReactNode;
}

const STYLES = {
  error: "bg-red-50 text-red-700 border-red-100",
  success: "bg-accent/10 text-accent border-accent/20",
  info: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function Alert({ kind = "info", children }: AlertProps) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-[10px] border px-4 py-2.5 text-[12px] font-semibold ${STYLES[kind]}`}
    >
      {children}
    </div>
  );
}
