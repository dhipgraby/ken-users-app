"use client";
import { useEffect, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Country {
  name: string;
  dialCode: string;
  code: string;
}

interface Props {
  form: any;
  fieldName: string;
  fieldLabel: string;
  userCountry?: any;
  initialDialCode?: any;
}

const SelectCountryFormField = ({ form, fieldName, fieldLabel, userCountry, initialDialCode }: Props) => {
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    console.log("use effect from select country form");

    setIsClient(true);
    if (typeof window !== "undefined") {
      import("country-list-with-dial-code-and-flag").then(module => {
        const CountryList = module.default || module;
        if (typeof CountryList.getAll === "function") {
          const _country = CountryList.getAll();
          setCountryList(_country);
          if (initialDialCode) {
            console.log("initialDialCode", initialDialCode);
            const defaultCountry = _country.find(country => country.dialCode === initialDialCode);
            console.log("defaultCountry", defaultCountry);

            if (defaultCountry) {
              setSelectedCountry(defaultCountry);
              form.setValue(fieldName, defaultCountry.dialCode);
            }
          } else if (userCountry) {
            const defaultCountry = _country.find(country => country.name === userCountry);
            if (defaultCountry) {
              setSelectedCountry(defaultCountry);
              form.setValue(fieldName, defaultCountry.name);
            }
          }
        }
      });
    }
  }, [initialDialCode, userCountry, form, fieldName]);

  const onSelectCountry = (value: string) => {
    const _country = countryList.at(Number(value));
    if (_country) {
      setSelectedCountry(_country);
      setIsPopoverOpen(false);
      if (initialDialCode) {
        form.setValue(fieldName, _country.dialCode);
      } else {
        form.setValue(fieldName, _country.name);
      }
    }
  };

  if (!isClient) {
    return null; // Return null when rendering on the server
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
              <>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPopoverOpen}
                      className="w-full flex justify-between space-x-1 truncate"
                    >
                      {selectedCountry ? (
                        <>
                          {userCountry && <p>{selectedCountry.name}</p>}
                          {initialDialCode && <p>{selectedCountry.dialCode}</p>}
                        </>
                      ) : (
                        "Country"
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <Command
                      filter={(value, search) => {
                        const _country = countryList.at(Number(value));
                        if (_country && _country.name.toLowerCase().includes(search.toLowerCase())) {
                          return 1;
                        }
                        return 0;
                      }}
                    >
                      <CommandInput placeholder="Search by country name" />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {countryList.map((country, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => onSelectCountry(index.toString())}
                              value={index.toString()}
                            >
                              <div className="w-full flex items-center justify-between">
                                {userCountry && <p>{country.name}</p>}
                                {initialDialCode && <><p>{country.dialCode}</p> <p>{country.name}</p></>}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SelectCountryFormField;
