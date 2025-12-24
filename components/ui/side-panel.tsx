"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import IconController from "@/components/icon-controller";

export type SidePanelProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  widthClass?: string; // e.g., "w-[640px]"
};

export default function SidePanel({ open, onClose, title, children, widthClass = "w-[720px]" }: SidePanelProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={(typeof title === "string" ? title : "Panel") as string}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full max-h-full overflow-hidden">
        <div
          className={`flex h-full ${widthClass} flex-col border-l bg-background text-foreground shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b px-4 py-3 md:px-6">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              onClick={onClose}
            >
              <IconController icon="X" className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
