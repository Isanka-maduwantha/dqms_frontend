import React, { useState, type ComponentPropsWithoutRef } from "react";

type buttonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
};
function SlotButton({ label, ...props }: buttonProps) {
 
  return (
    <button className={`${props.className}`} {...props}>
      {label}
    </button>
  );
}

export default SlotButton;
