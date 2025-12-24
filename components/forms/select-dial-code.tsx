"use client";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
// Replaced Radix Popover (trigger caused React 19 element.ref warning) with headless popover logic
import { ChevronsUpDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Country {
    name: string;
    dialCode: string;
    code: string;
}

interface SelectDialCodeProps {
    form: any;
    fieldName: string;
    fieldLabel: string;
    initialDialCode?: any;
}

const SelectDialCode = ({ form, fieldName, fieldLabel, initialDialCode }: SelectDialCodeProps) => {
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  // for aria-controls to link combobox trigger and listbox
  const listboxId = React.useId();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      import("country-list-with-dial-code-and-flag").then(module => {
        const CountryList = module.default || module;
        if (typeof CountryList.getAll === "function") {
          const _country = CountryList.getAll();
          setCountryList(_country);
          if (initialDialCode) {
            const defaultCountry = _country.find(country => country.dialCode === initialDialCode);
            if (defaultCountry) {
              setSelectedCountry(defaultCountry);
              form.setValue(fieldName, defaultCountry.dialCode);
            }
          }
        }
      });
    }
  }, [initialDialCode, form, fieldName]);

  const onSelectCountry = (value: string) => {
    const _country = countryList.at(Number(value));
    if (_country) {
      setSelectedCountry(_country);
      setIsPopoverOpen(false);
      form.setValue(fieldName, _country.dialCode);
    }
  };

  // close on outside click / escape (must always declare hook to keep order stable)
  useEffect(() => {
    if (!isClient || !isPopoverOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsPopoverOpen(false);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setIsPopoverOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [isClient, isPopoverOpen]);

  if (!isClient) {
    return null; // Defer rendering until client hydration to avoid mismatch
  }

  return (
    <div>
      <FormField
        control={form.control}
        name={fieldName}
        render={() => (
          <FormItem>
            <FormLabel>{fieldLabel}</FormLabel>
            <FormControl>
              <div className="relative">
                <button
                  type="button"
                  ref={triggerRef}
                  onClick={() => setIsPopoverOpen(o => !o)}
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  aria-controls={listboxId}
                  aria-haspopup="listbox"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full flex justify-between space-x-1 truncate"
                  )}
                >
                  {selectedCountry ? selectedCountry.dialCode : "Dial Code"}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
                {isPopoverOpen && (
                  <div
                    ref={panelRef}
                    role="listbox"
                    id={listboxId}
                    aria-label="Dial codes"
                    className="absolute z-50 mt-2 w-[300px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none"
                  >
                    <Command
                      filter={(value, search) => {
                        const _country = countryList.at(Number(value));
                        if (!_country) return 0;
                        const q = String(search ?? "").trim().toLowerCase();
                        if (!q) return 1;
                        const normalizedQ = q.replace(/\+/g, "");
                        const dial = String(_country.dialCode ?? "").toLowerCase().replace(/\+/g, "");
                        const name = String(_country.name ?? "").toLowerCase();
                        if (dial.includes(normalizedQ) || name.includes(normalizedQ) || name.includes(q)) {
                          return 1;
                        }
                        return 0;
                      }}
                    >
                      <CommandInput placeholder="Search by dial code or country" />
                      <CommandList>
                        <CommandEmpty>No dial code found.</CommandEmpty>
                        <CommandGroup>
                          {countryList.map((country, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => onSelectCountry(index.toString())}
                              value={index.toString()}
                            >
                              <div className="w-full flex items-center justify-between">
                                <p>{country.dialCode}</p> <p>{country.name}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SelectDialCode;
