import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { masterDataService } from '@/services/master-data.service';

interface AutocompleteInputProps {
    category: 'skills' | 'qualifications' | 'languages' | 'job_titles' | 'tags' | 'requirements' | 'countries' | 'states' | 'nationalities';
    value: string;
    onChange: (value: string) => void;
    onSelect?: (value: string | any) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    icon?: React.ReactNode;
    inputClassName?: string;
    filterId?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    category,
    value,
    onChange,
    onSelect,
    onKeyPress,
    placeholder,
    className,
    id,
    icon,
    inputClassName,
    filterId
}) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                let data: any[] = [];
                switch (category) {
                    case 'skills': data = await masterDataService.getSkills(); break;
                    case 'qualifications': data = await masterDataService.getQualifications(); break;
                    case 'languages': data = await masterDataService.getLanguages(); break;
                    case 'job_titles': data = await masterDataService.getJobTitles(); break;
                    case 'tags': data = await masterDataService.getTags(); break;
                    case 'requirements': data = await masterDataService.getRequirements(); break;
                    case 'countries': data = await masterDataService.getCountries(); break;
                    case 'states': data = await masterDataService.getStates(filterId); break;
                    case 'nationalities': data = await masterDataService.getNationalities(); break;
                }
                setSuggestions(data);
            } catch (error) {
                console.error(`Error fetching suggestions for ${category}:`, error);
            }
        };
        fetchSuggestions();
    }, [category, filterId]);

    useEffect(() => {
        if (!value || value.trim() === '') {
            setFilteredSuggestions([]);
            return;
        }
        const filtered = suggestions.filter(s =>
            s.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setActiveIndex(0);
    }, [value, suggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion: any) => {
        onChange(suggestion.name);
        if (onSelect) onSelect(suggestion);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen && filteredSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(filteredSuggestions[activeIndex]);
                return;
            }
        }
        // If not handling selection, allow default behavior or propagation
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {icon}
                </div>
            )}
            <Input
                id={id}
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyPress?.(e)}
                placeholder={placeholder}
                className={`pr-10 ${icon ? 'pl-11' : ''} ${inputClassName || ''}`}
            />
            {value && (
                <button
                    onClick={() => {
                        onChange('');
                        setIsOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((s, index) => (
                        <button
                            key={s.id || s.name}
                            onClick={() => handleSelect(s)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`w-full text-left px-4 py-2 text-body-sm transition-colors ${index === activeIndex ? 'bg-muted' : 'hover:bg-muted'
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
