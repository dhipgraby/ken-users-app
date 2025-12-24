"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import IconController from "@/components/icon-controller";

export type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., "max-w-5xl"
};

export function BaseModal({ open, onClose, title, children, maxWidthClass = "max-w-3xl" }: BaseModalProps) {
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title || "Modal"}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative mx-auto my-8 flex min-h-[calc(100%-4rem)] items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidthClass} overflow-hidden rounded-xl border bg-background text-foreground shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b px-4 py-3 md:px-6">
            <h1 className="text-base font-semibold">{title}</h1>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              onClick={onClose}
            >
              <IconController icon="X" className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BaseModal;
