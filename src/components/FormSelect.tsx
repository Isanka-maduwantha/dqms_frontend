import type { ComponentProps } from "react";

type FormSelectProps = ComponentProps<"select"> & {
  label: string;
  padding?: string;
};

export default function FormSelect({
  label,
  padding = "16px",
  id,
  children,
  ...props
}: FormSelectProps) {
  return (
    <div className="flex flex-col w-full" style={{ paddingTop: padding }}>
      <label
        className="font-inter text-[12px] font-bold text-green-text-1 text-left"
        htmlFor={id}
      >
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="pl-4 pr-4 pt-2.75 pb-2.75 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[14px]"
      >
        {children}
      </select>
    </div>
  );
}
