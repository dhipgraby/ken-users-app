"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Headless Select (React 19 compatible) replicating the public API of previous Radix-based wrapper.

type SelectContextValue = {
  value: string | undefined;
  setValue: (v: string) => void;
  placeholder?: string;
  registerItem: (item: { value: string; label: string }) => void;
  items: Array<{ value: string; label: string }>;
  close: () => void;
  open: () => void;
  isOpen: boolean;
  triggerId: string;
  listboxId: string;
};

const SelectCtx = React.createContext<SelectContextValue | null>(null);

interface RootProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}

const Select = ({ defaultValue, value: controlled, onValueChange, children }: RootProps) => {
  const isControlled = controlled !== undefined;
  const [uncontrolledValue, setUncontrolled] = React.useState<string | undefined>(defaultValue);
  const value = isControlled ? controlled : uncontrolledValue;
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState<Array<{ value: string; label: string }>>([]);
  const triggerId = React.useId();
  const listboxId = React.useId();

  const registerItem = React.useCallback((item: { value: string; label: string }) => {
    setItems(prev => (prev.find(i => i.value === item.value) ? prev : [...prev, item]));
  }, []);

  const setValue = React.useCallback((v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  }, [isControlled, onValueChange]);

  const ctx: SelectContextValue = {
    value,
    setValue,
    placeholder: undefined,
    registerItem,
    items,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    triggerId,
    listboxId
  };

  return <SelectCtx.Provider value={ctx}>{children}</SelectCtx.Provider>;
};

// Trigger
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext<SelectContextValue | null>(SelectCtx);
    if (!ctx) throw new Error("SelectTrigger must be used within <Select>");
    const { isOpen, open, close, listboxId, triggerId } = ctx;
    const toggle = () => (isOpen ? close() : open());
    return (
      <button
        id={triggerId}
        ref={ref}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={toggle}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// Value (displays selected or placeholder)
interface SelectValueProps { placeholder?: string; className?: string }
const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  const ctx = React.useContext<SelectContextValue | null>(SelectCtx);
  if (!ctx) throw new Error("SelectValue must be used within <Select>");
  const { value, items } = ctx;
  const current = items.find(i => i.value === value);
  // Fallback to showing the raw value if items haven't registered yet (e.g., content not mounted)
  const display = current?.label ?? (value ?? placeholder);
  return <span className={cn("flex-1 text-left", className)}>{display}</span>;
};
SelectValue.displayName = "SelectValue";

// Content (popover list)
interface ContentProps extends React.HTMLAttributes<HTMLDivElement> { forceMount?: boolean }
const SelectContent = React.forwardRef<HTMLDivElement, ContentProps>(({ className, children, forceMount, ...props }, ref) => {
  const ctx = React.useContext<SelectContextValue | null>(SelectCtx);
  if (!ctx) throw new Error("SelectContent must be used within <Select>");
  const { isOpen, close, listboxId, triggerId } = ctx;
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  // Positioning state (fixed coordinates)
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const updatePosition = React.useCallback(() => {
    const el = document.getElementById(triggerId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const padding = 8;
    const left = Math.min(Math.max(r.left, padding), Math.max(padding, window.innerWidth - r.width - padding));
    const top = r.bottom + 4; // 4px gap below trigger
    setPos({ top, left, width: r.width });
  }, [triggerId]);

  // Close on outside click / escape
  React.useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (contentRef.current?.contains(t) || (document.getElementById(triggerId)?.contains(t))) return;
      close();
    };
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen, close, triggerId, updatePosition]);

  if (!isOpen && !forceMount) return null;
  const fallbackEl = typeof document !== "undefined" ? document.getElementById(triggerId) : null;
  const fallbackRect = fallbackEl?.getBoundingClientRect();
  const styleTop = pos.top || (fallbackRect ? fallbackRect.bottom + 4 : 0);
  const styleLeft = pos.left || (fallbackRect ? fallbackRect.left : 0);
  const styleMinWidth = pos.width || (fallbackRect ? fallbackRect.width : undefined);
  // Merge user-provided styles (e.g., borderColor) without losing computed positioning
  const { style: userStyle, ...restProps } = props;
  const mergedStyle: React.CSSProperties = {
    position: "fixed",
    top: styleTop,
    left: styleLeft,
    minWidth: styleMinWidth,
    // When forceMount is enabled and content is closed, keep it hidden but mounted
    ...(isOpen ? {} : (forceMount ? { display: "none" } : {})),
    ...(userStyle || {})
  };
  return createPortal(
    <div
      ref={contentRef}
      role="listbox"
      id={listboxId}
      aria-labelledby={triggerId}
      style={mergedStyle}
      className={cn(
        "z-50 max-h-64 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
        className
      )}
      {...restProps}
    >
      {children}
    </div>,
    document.body
  );
});
SelectContent.displayName = "SelectContent";

// Group (simple wrapper)
const SelectGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="group" className={className} {...props} />
);
SelectGroup.displayName = "SelectGroup";

// Label
const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1.5 pl-2 pr-2 text-xs font-semibold text-muted-foreground", className)} {...props} />
));
SelectLabel.displayName = "SelectLabel";

// Item
interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { value: string; dataLabel?: string }
const SelectItem = React.forwardRef<HTMLButtonElement, ItemProps>(({ className, children, value, dataLabel, ...props }, ref) => {
  const ctx = React.useContext<SelectContextValue | null>(SelectCtx);
  if (!ctx) throw new Error("SelectItem must be used within <Select>");
  const { setValue, value: current, registerItem, close } = ctx;
  const label = dataLabel ?? (typeof children === "string" ? children : (Array.isArray(children) ? children.join(" ") : (typeof children === "number" ? String(children) : undefined))) ?? value;
  React.useEffect(() => {
    registerItem({ value, label });
  }, [value, label, registerItem]);
  const selected = current === value;
  return (
    <button
      ref={ref}
      role="option"
      aria-selected={selected}
      data-selected={selected ? "" : undefined}
      onClick={() => {
        setValue(value); close();
      }}
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-6 pr-2 text-sm outline-none data-[selected]:bg-accent data-[selected]:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 inline-flex w-3.5 items-center justify-center">
        {selected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

// No-ops kept for API compatibility (were scroll buttons before)
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
};

