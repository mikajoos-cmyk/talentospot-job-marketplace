import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { countries } from "../../data/countries";
import { searchCities, GeoLocation } from "../../utils/geocoding";
import { Input } from '../../components/ui/input';

export interface LocationValue {
    city: string;
    street?: string;
    houseNumber?: string;
    country: string;
    state: string;
    postalCode: string;
    lat: number;
    lon: number;
}

interface LocationPickerProps {
    value: Partial<LocationValue>;
    onChange: (value: LocationValue) => void;
    className?: string;
    mode?: 'address' | 'city';
}

export function LocationPicker({ value, onChange, className, mode = 'address' }: LocationPickerProps) {
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize selected country
    useEffect(() => {
        if (value.country) {
            const country = countries.find(c => c.name === value.country);
            if (country) setSelectedCountryCode(country.code);
        }
    }, [value.country]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!val || val.length < 2 || !selectedCountryCode) {
            setSuggestions([]);
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            const results = await searchCities(val, selectedCountryCode, mode);
            setSuggestions(results);
            setLoading(false);
        }, 400);
    };

    const handleSelect = (location: GeoLocation) => {
        const countryName = countries.find(c => c.code === selectedCountryCode)?.name || value.country || "";

        onChange({
            city: location.city || "",
            street: location.street || "",
            houseNumber: location.houseNumber || "",
            country: countryName,
            state: location.state || "",
            postalCode: location.postalCode || "",
            lat: location.lat,
            lon: location.lon
        });

        setSearchQuery("");
        setSuggestions([]);
        setOpen(false);
    };



    const handleCountryChange = (code: string) => {
        setSelectedCountryCode(code);
        const countryName = countries.find(c => c.code === code)?.name || "";
        onChange({
            city: "",
            street: "",
            houseNumber: "",
            country: countryName,
            state: "",
            postalCode: "",
            lat: 0,
            lon: 0
        });
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Search Section */}
            <div className="space-y-2">
                <Label className="text-primary font-semibold flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">1</span>
                    Search & Validate Address
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-12 text-muted-foreground font-normal border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                            <span className="truncate">
                                {loading ? "Searching..." : mode === 'city' ? "Type here to find city automatically..." : "Type here to find full address automatically..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder={mode === 'city' ? "Start typing city name..." : "Start typing address (e.g. Street 5, Berlin)..."}
                                value={searchQuery}
                                onValueChange={handleSearchChange}
                                className="h-12 border-none focus:ring-0"
                            />
                            <CommandList className="max-h-[300px]">
                                {loading && (
                                    <div className="py-10 text-center text-sm text-muted-foreground">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2 opacity-20" />
                                        Finding address details...
                                    </div>
                                )}
                                {!loading && searchQuery.length >= 2 && suggestions.length === 0 && (
                                    <CommandEmpty className="py-10 text-center text-sm text-muted-foreground italic">
                                        No matching address found. Try adding more details.
                                    </CommandEmpty>
                                )}
                                <CommandGroup heading="Verified Locations">
                                    {suggestions.map((item, index) => (
                                        <CommandItem
                                            key={`${item.lat}-${item.lon}-${index}`}
                                            value={`${index}`} // MUST use simple index string for cmdk
                                            onSelect={() => handleSelect(item)}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSelect(item);
                                            }}
                                            className="p-3 cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground group"
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-primary group-aria-selected:bg-primary-foreground" />
                                                <div className="flex flex-col flex-1 overflow-hidden">
                                                    <span className="font-medium truncate">
                                                        {item.street ? `${item.street} ${item.houseNumber || ''}, ` : ''}{item.city}
                                                    </span>
                                                    <span className="text-xs opacity-70 truncate">
                                                        {item.displayName}
                                                    </span>
                                                </div>
                                                <Check className="h-4 w-4 opacity-0 group-aria-selected:opacity-100 shrink-0" />
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Manual Fields Grid (Read-Only) */}
            <div className="space-y-4 pt-4 border-t border-border/50">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    {mode === 'city' ? 'Location Details (Auto-filled)' : 'Address Details (Auto-filled)'}
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-2">
                        <Label className="text-xs">Country *</Label>
                        <Select value={selectedCountryCode} onValueChange={handleCountryChange}>
                            <SelectTrigger className="h-10 bg-background">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === 'address' && (
                        <>
                            <div className="md:col-span-5 space-y-2">
                                <Label className="text-xs">Street</Label>
                                <Input
                                    value={value.street || ""}
                                    readOnly
                                    placeholder="Street name"
                                    className="h-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                                />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <Label className="text-xs">No.</Label>
                                <Input
                                    value={value.houseNumber || ""}
                                    readOnly
                                    placeholder="12A"
                                    className="h-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {mode === 'address' && (
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-xs">Postal Code</Label>
                            <Input
                                value={value.postalCode || ""}
                                readOnly
                                placeholder="ZIP Code"
                                className="h-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                            />
                        </div>
                    )}

                    <div className={cn("space-y-2", mode === 'city' ? "md:col-span-8" : "md:col-span-5")}>
                        <Label className="text-xs">City *</Label>
                        <Input
                            value={value.city || ""}
                            readOnly
                            placeholder="City"
                            className="h-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                        />
                    </div>

                    <div className="md:col-span-4 space-y-2">
                        <Label className="text-xs">State / Region</Label>
                        <Input
                            value={value.state || ""}
                            readOnly
                            placeholder="State"
                            className="h-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                        />
                    </div>
                </div>
            </div>

            {!selectedCountryCode && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-amber-600 text-xs flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Please select a country first to enable address search.
                </div>
            )}
        </div>
    );
}
