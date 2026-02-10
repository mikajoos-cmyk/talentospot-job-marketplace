import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

const AdminSettings = () => {
    const [resumeRequired, setResumeRequired] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'resume_required_at_registration')
                .single();

            if (error) throw error;
            if (data) {
                setResumeRequired(data.value as boolean);
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminSettings;