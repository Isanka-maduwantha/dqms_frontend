import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export default function Modal({ open, title, onClose, children, width = "max-w-lg" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${width} bg-white rounded-[16px] shadow-xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-grey shrink-0">
          <h3 className="font-manrope font-bold text-[16px] text-green-text-1">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-green hover:text-green-text-1 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
