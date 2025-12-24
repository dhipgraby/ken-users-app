"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import IconController from "@/components/icon-controller";
import { cn } from "@/lib/utils";

function fmt(d: Date | null): string {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export type DatePickerProps = {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  className?: string; // wrapper
  inputClassName?: string;
  brandColor?: string; // e.g., "#0F5E59"
};

export function DatePicker({ value, onChange, placeholder = "dd/mm/yyyy", className, inputClassName, brandColor = "#0F5E59" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(value ?? new Date());
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [inputText, setInputText] = React.useState<string>(fmt(value));

  const updatePosition = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const padding = 8;
    const left = Math.min(Math.max(r.left, padding), Math.max(padding, window.innerWidth - r.width - padding));
    const top = r.bottom + 4;
    setPos({ top, left, width: r.width });
  }, []);

  React.useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    const onScrollResize = () => updatePosition();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, updatePosition]);

  const selectDate = (d: Date) => {
    onChange(d);
    setVisibleMonth(d);
    setInputText(fmt(d));
    setOpen(false);
  };

  React.useEffect(() => {
    setInputText(fmt(value));
    if (value) setVisibleMonth(value);
  }, [value]);

  function validDate(y: number, m: number, d: number): Date | null {
    const dt = new Date(y, m, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m || dt.getDate() !== d) return null;
    return dt;
  }

  function tryParse(text: string, current: Date | null): Date | null {
    const s = text.trim();
    if (!s) return null;
    // dd/mm/yyyy
    const m1 = s.match(/^([0-3]?\d)[-/]([0-1]?\d)[-/](\d{4})$/);
    if (m1) {
      const d = parseInt(m1[1], 10);
      const mo = parseInt(m1[2], 10) - 1;
      const y = parseInt(m1[3], 10);
      return validDate(y, mo, d);
    }
    // mm/yyyy → keep current day or use 1st
    const m2 = s.match(/^([0-1]?\d)[-/](\d{4})$/);
    if (m2) {
      const mo = parseInt(m2[1], 10) - 1;
      const y = parseInt(m2[2], 10);
      const base = current ?? new Date();
      const day = base.getDate();
      return validDate(y, mo, day) ?? validDate(y, mo, 1);
    }
    // yyyy only → keep month/day from current or fallback to today
    const m3 = s.match(/^(\d{4})$/);
    if (m3) {
      const y = parseInt(m3[1], 10);
      const base = current ?? new Date();
      const mo = base.getMonth();
      const day = base.getDate();
      return validDate(y, mo, day) ?? validDate(y, mo, 1);
    }
    return null;
  }

  // Build calendar cells
  const start = startOfMonth(visibleMonth);
  const end = endOfMonth(visibleMonth);
  const startWeekday = start.getDay(); // 0 Sun - 6 Sat
  const daysInMonth = end.getDate();
  const cells: Array<{ day: number | null; date?: Date }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const isSameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div className={className}>
      <div
        ref={triggerRef}
        className={cn("relative flex h-10 w-full items-center rounded-md border bg-background text-sm", inputClassName)}
        style={{ borderColor: brandColor, boxShadow: open ? `0 0 0 2px ${brandColor}33` : undefined }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          className={cn("h-full w-full rounded-md bg-transparent px-3 py-2 focus:outline-none")}
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const parsed = tryParse(inputText, value);
              if (parsed) selectDate(parsed);
              else setInputText(fmt(value));
            }
          }}
          onBlur={() => {
            // Defer to check where focus moved; if it's inside the calendar panel, do nothing
            setTimeout(() => {
              const active = document.activeElement as HTMLElement | null;
              if (active && (panelRef.current?.contains(active) || triggerRef.current?.contains(active))) {
                return;
              }
              const parsed = tryParse(inputText, value);
              if (parsed) selectDate(parsed);
              else setInputText(fmt(value));
            }, 0);
          }}
        />
        <button
          type="button"
          aria-label="Open calendar"
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
          onClick={() => setOpen((o) => !o)}
        >
          <IconController icon="calendar" />
        </button>
      </div>
      {open && createPortal(
        <div
          ref={panelRef}
          className="z-50 rounded-md border bg-popover p-3 text-popover-foreground shadow-md"
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width }}
          role="dialog"
          aria-label="Choose date"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <IconController icon="left" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {visibleMonth.toLocaleString(undefined, { month: "long" })}
              </div>
              <input
                type="number"
                inputMode="numeric"
                className="h-8 w-20 rounded border px-2 text-sm"
                value={visibleMonth.getFullYear()}
                onChange={(e) => {
                  const y = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(y)) setVisibleMonth(new Date(y, visibleMonth.getMonth(), 1));
                }}
                onBlur={(e) => {
                  const y = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(y)) setVisibleMonth(new Date(y, visibleMonth.getMonth(), 1));
                }}
                aria-label="Year"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
              onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <IconController icon="right" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 px-1 pb-1 text-center text-xs text-muted-foreground">
            {"Su Mo Tu We Th Fr Sa".split(" ").map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 px-1">
            {cells.map((c, i) => {
              if (c.day === null) return <div key={i} className="h-9" />;
              const selected = isSameDay(c.date!, value);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => c.date && selectDate(c.date)}
                  className={cn(
                    "h-9 rounded-md text-sm hover:bg-accent hover:text-accent-foreground",
                    selected && "bg-[var(--brand)] text-white hover:opacity-90"
                  )}
                  style={{ ["--brand" as any]: brandColor } as React.CSSProperties}
                >
                  {c.day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default DatePicker;
