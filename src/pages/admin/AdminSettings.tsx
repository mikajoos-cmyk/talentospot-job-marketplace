import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminSettings = () => {
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminSettings;