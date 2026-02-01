import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Car, Truck, Plus, X } from 'lucide-react';
import { Separator } from '../ui/separator';

interface DrivingLicenseSelectorProps {
    value: string[];
    onChange: (value: string[]) => void;
    className?: string;
}

const PKW_CLASSES = ['B', 'BE', 'B96', 'AM', 'L', 'T'];
const LKW_CLASSES = ['C', 'CE', 'C1', 'C1E', 'D', 'DE'];

const DrivingLicenseSelector: React.FC<DrivingLicenseSelectorProps> = ({ value, onChange, className }) => {
    const [showPkw, setShowPkw] = useState(false);
    const [showLkw, setShowLkw] = useState(false);
    const [customInput, setCustomInput] = useState('');

    // Initialize show states based on existing values
    useEffect(() => {
        const hasPkw = value.some(val => PKW_CLASSES.includes(val));
        const hasLkw = value.some(val => LKW_CLASSES.includes(val));

        if (hasPkw) setShowPkw(true);
        if (hasLkw) setShowLkw(true);
    }, []);

    const toggleClass = (cls: string) => {
        const newValue = value.includes(cls)
            ? value.filter(v => v !== cls)
            : [...value, cls];
        onChange(newValue);
    };

    const handleAddCustom = () => {
        if (customInput.trim() && !value.includes(customInput.trim())) {
            onChange([...value, customInput.trim()]);
            setCustomInput('');
        }
    };

    const removeCustom = (cls: string) => {
        onChange(value.filter(v => v !== cls));
    };

    const customLicenses = value.filter(v => !PKW_CLASSES.includes(v) && !LKW_CLASSES.includes(v));

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex flex-wrap gap-4">
                <Button
                    type="button"
                    variant={showPkw ? "default" : "outline"}
                    onClick={() => setShowPkw(!showPkw)}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold transition-all"
                >
                    <Car className="w-5 h-5" />
                    PKW License
                </Button>
                <Button
                    type="button"
                    variant={showLkw ? "default" : "outline"}
                    onClick={() => setShowLkw(!showLkw)}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold transition-all"
                >
                    <Truck className="w-5 h-5" />
                    Truck License
                </Button>
            </div>

            {(showPkw || showLkw) && (
                <div className="space-y-8 p-6 bg-muted/20 rounded-2xl border border-border/40 animate-in fade-in slide-in-from-top-2 duration-300">
                    {showPkw && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Car className="w-4 h-4 text-primary" />
                                <h4 className="font-bold">Car Classes (PKW)</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PKW_CLASSES.map(cls => (
                                    <button
                                        key={cls}
                                        type="button"
                                        onClick={() => toggleClass(cls)}
                                        className={`w-12 h-12 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center ${value.includes(cls)
                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                                : 'bg-white border-border/60 text-foreground hover:border-primary/40'
                                            }`}
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showPkw && showLkw && <Separator className="bg-border/60" />}

                    {showLkw && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Truck className="w-4 h-4 text-secondary" />
                                <h4 className="font-bold">Truck Classes (LKW)</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {LKW_CLASSES.map(cls => (
                                    <button
                                        key={cls}
                                        type="button"
                                        onClick={() => toggleClass(cls)}
                                        className={`w-12 h-12 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center ${value.includes(cls)
                                                ? 'bg-secondary border-secondary text-secondary-foreground shadow-lg shadow-secondary/20 scale-105'
                                                : 'bg-white border-border/60 text-foreground hover:border-secondary/40'
                                            }`}
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-border/60">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom / Other Licenses</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Forklift, Boat..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                                className="h-10 bg-white"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="border-dashed border-2 border-border h-10 w-10 shrink-0"
                                onClick={handleAddCustom}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {customLicenses.map(cls => (
                                <span
                                    key={cls}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/20"
                                >
                                    {cls}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-primary/70"
                                        onClick={() => removeCustom(cls)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrivingLicenseSelector;
