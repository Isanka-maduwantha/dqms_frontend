import React, { type ComponentPropsWithoutRef, type ReactNode } from "react";
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  label?: string;
  children?: ReactNode;
  containerProps?: ComponentPropsWithoutRef<"div">;
};
export default function CommonButton({
  label,
  children,
  containerProps,
  className = "",
  ...props
}: ButtonProps) {
  const { className: containerClassName = "", ...restContainerProps } =
    containerProps || {};

  return (
    <div
      className={`btn-cont justify-center items-center flex w-full ${containerClassName}`.trim()}
      {...restContainerProps}
    >
      <button
        className={`rounded-[10px] w-full bg-accent text-white ${className}`.trim()}
        {...props}
      >
        {children ?? label}
      </button>
    </div>
  );
}