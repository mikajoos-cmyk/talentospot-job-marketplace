import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const AdminSettings = () => {
    const [resumeRequired, setResumeRequired] = useState(false);
    const [contentMaxWidth, setContentMaxWidth] = useState('max-w-7xl');
    const [searchMaxWidth, setSearchMaxWidth] = useState('max-w-7xl');
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { refreshSettings } = useSettings();

    const widthOptions = [
        { label: 'Extra Small (max-w-4xl)', value: 'max-w-4xl' },
        { label: 'Small (max-w-5xl)', value: 'max-w-5xl' },
        { label: 'Medium (max-w-6xl)', value: 'max-w-6xl' },
        { label: 'Large (max-w-7xl)', value: 'max-w-7xl' },
        { label: 'Extra Large (max-w-screen-xl)', value: 'max-w-screen-xl' },
        { label: '2XL (max-w-screen-2xl)', value: 'max-w-screen-2xl' },
        { label: '1200px (max-w-[1200px])', value: 'max-w-[1200px]' },
        { label: '1400px (max-w-[1400px])', value: 'max-w-[1400px]' },
        { label: '1600px (max-w-[1600px])', value: 'max-w-[1600px]' },
        { label: 'Full Width (max-w-none)', value: 'max-w-none' },
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*');

            if (error) throw error;
            if (data) {
                const resumeReq = data.find(s => s.key === 'resume_required_at_registration');
                if (resumeReq) setResumeRequired(resumeReq.value);
                
                const maxWidth = data.find(s => s.key === 'content_max_width');
                if (maxWidth) setContentMaxWidth(maxWidth.value);

                const sMaxWidth = data.find(s => s.key === 'search_max_width');
                if (sMaxWidth) setSearchMaxWidth(sMaxWidth.value);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleResumeRequired = async (checked: boolean) => {
        try {
            setResumeRequired(checked);
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key: 'resume_required_at_registration',
                    value: checked,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) throw error;
            
            showToast({
                title: 'Einstellungen gespeichert',
                description: `Lebenslauf-Pflicht wurde ${checked ? 'aktiviert' : 'deaktiviert'}.`,
            });
        } catch (error: any) {
            console.error('Error updating settings:', error);
            showToast({
                title: 'Fehler beim Speichern',
                description: error.message || 'Die Einstellung konnte nicht aktualisiert werden.',
                variant: 'destructive',
            });
            // Revert on error
            setResumeRequired(!checked);
        }
    };

    const handleUpdateMaxWidth = async (key: string, value: string) => {
        try {
            if (key === 'content_max_width') setContentMaxWidth(value);
            else if (key === 'search_max_width') setSearchMaxWidth(value);

            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key: key,
                    value: value,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                });

            if (error) throw error;

            await refreshSettings();
            
            showToast({
                title: 'Einstellungen gespeichert',
                description: `Einstellung ${key} wurde auf ${value} aktualisiert.`,
            });
        } catch (error: any) {
            console.error('Error updating settings:', error);
            showToast({
                title: 'Fehler beim Speichern',
                description: error.message || 'Die Einstellung konnte nicht aktualisiert werden.',
                variant: 'destructive',
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Systemeinstellungen</h1>
                <Card>
                    <CardHeader><CardTitle>Allgemein</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Wartungsmodus</Label>
                                <p className="text-sm text-muted-foreground">Plattform für alle Nutzer sperren</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Registrierung erlaubt</Label>
                                <p className="text-sm text-muted-foreground">Neue Nutzer können sich registrieren</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="resume-required">Lebenslauf-Pflicht bei Registrierung</Label>
                                <p className="text-sm text-muted-foreground">Talente müssen bei der Registrierung einen Lebenslauf hochladen</p>
                            </div>
                            <Switch 
                                id="resume-required"
                                checked={resumeRequired}
                                onCheckedChange={handleToggleResumeRequired}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-width">Maximale Inhaltsbreite</Label>
                            <p className="text-sm text-muted-foreground">Definiert die maximale Breite des Inhaltsbereichs auf allen Seiten</p>
                            <div className="flex gap-2">
                                {loading ? (
                                    <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <Select 
                                        value={contentMaxWidth} 
                                        onValueChange={(val) => handleUpdateMaxWidth('content_max_width', val)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="max-width" className="w-full border-primary/20">
                                            <SelectValue placeholder="Größe auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {widthOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="search-max-width">Maximale Inhaltsbreite Suchseiten</Label>
                            <p className="text-sm text-muted-foreground">Definiert die maximale Breite speziell für die Job- und Kandidatensuche</p>
                            <div className="flex gap-2">
                                {loading ? (
                                    <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <Select 
                                        value={searchMaxWidth} 
                                        onValueChange={(val) => handleUpdateMaxWidth('search_max_width', val)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger id="search-max-width" className="w-full border-primary/20">
                                            <SelectValue placeholder="Größe auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {widthOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminSettings;