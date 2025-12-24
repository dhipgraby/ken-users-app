"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal headless dialog implementation compatible with existing API

type DialogContextType = { open: boolean; setOpen: (v: boolean) => void } | null;
const DialogContext = React.createContext<DialogContextType>(null);

type DialogRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

const Dialog = ({ open: controlledOpen, defaultOpen, onOpenChange, children }: DialogRootProps) => {
  const [uOpen, setUOpen] = React.useState<boolean>(defaultOpen ?? false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? !!controlledOpen : uOpen;
  const setOpen = React.useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!isControlled) setUOpen(v);
    },
    [isControlled, onOpenChange]
  );
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
};

type DialogTriggerProps = { asChild?: boolean; children: React.ReactElement<any> };
const DialogTrigger = ({ asChild, children }: DialogTriggerProps) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return children;
  const handleClick = (e: React.MouseEvent) => {
    const prev = (children.props as any)?.onClick as ((e: React.MouseEvent) => void) | undefined;
    prev?.(e);
    if (!e.defaultPrevented) ctx.setOpen(true);
  };
  return asChild ? React.cloneElement(children as React.ReactElement<any>, { onClick: handleClick } as any) : (
    <button type="button" onClick={handleClick}>{children}</button>
  );
};

const DialogPortal = ({ children }: { children: React.ReactNode }) => createPortal(<>{children}</>, document.body);

const DialogOverlay = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out pointer-events-auto cursor-default",
        className
      )}
      data-state="open"
      onClick={() => ctx.setOpen(false)}
      {...props}
    />
  );
};
DialogOverlay.displayName = "DialogOverlay";

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
const DialogContent = ({ className, children, ...props }: DialogContentProps) => {
  const ctx = React.useContext(DialogContext);
  const isOpen = !!ctx?.open;
  const setOpen = React.useMemo(() => ctx?.setOpen ?? (() => {}), [ctx?.setOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg pointer-events-auto cursor-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogPortal>
  );
};
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
DialogDescription.displayName = "DialogDescription";

type DialogCloseProps = { asChild?: boolean; children?: React.ReactElement } & React.ButtonHTMLAttributes<HTMLButtonElement>;
const DialogClose = ({ asChild, children, ...props }: DialogCloseProps) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return asChild && children ? children : <button {...props} />;
  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    if (!e.defaultPrevented) ctx.setOpen(false);
  };
  if (asChild && children) return React.cloneElement(children as React.ReactElement<any>, { onClick: handle } as any);
  return <button type="button" {...props} onClick={handle} />;
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
