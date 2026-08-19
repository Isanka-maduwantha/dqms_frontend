import type { ComponentPropsWithoutRef } from "react";

export default function Card({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`bg-white border border-border-grey rounded-[14px] p-5 ${className}`}
      {...props}
    />
  );
}
