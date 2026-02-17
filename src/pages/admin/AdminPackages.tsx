import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, Check, X, Shield, Clock, Users, Briefcase, Search } from 'lucide-react';
import { packagesService } from '@/services/packages.service';
import { useToast } from '@/contexts/ToastContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminPackages: React.FC = () => {
    const { showToast } = useToast();
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPackage, setEditingPackage] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await packagesService.getAllPackagesForAdmin();
            setPackages(data || []);
        } catch (error: any) {
            showToast({
                title: 'Fehler',
                description: 'Pakete konnten nicht geladen werden: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        try {
            setSaving(true);
            const { id, created_at, ...updates } = editingPackage;
            await packagesService.updatePackage(id, updates);
            showToast({ title: 'Gespeichert', description: 'Paket erfolgreich aktualisiert' });
            setIsEditOpen(false);
            fetchPackages();
        } catch (error: any) {
            showToast({
                title: 'Fehler',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const renderPackageGrid = (role: 'candidate' | 'employer') => {
        const filteredPackages = packages.filter(pkg => pkg.target_role === role);

        if (filteredPackages.length === 0) {
            return (
                <div className="text-center p-12 bg-muted/30 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Keine Pakete für {role === 'candidate' ? 'Talente' : 'Arbeitgeber'} gefunden.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className={`${!pkg.is_active ? 'opacity-70 grayscale-[0.5]' : ''} relative overflow-hidden flex flex-col`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant={pkg.is_active ? "success" : "secondary"} className="mb-2">
                                        {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                                    </Badge>
                                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => { setEditingPackage({ ...pkg }); setIsEditOpen(true); }}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">€{pkg.price_yearly}</span>
                                <span className="text-muted-foreground text-sm">/ Jahr</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                {role === 'employer' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            <span>Jobs: <b>{pkg.limit_jobs ?? 'Unbegrenzt'}</b></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span>Kontakte: <b>{pkg.limit_contacts ?? 'Unbegrenzt'}</b></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Shield className="w-4 h-4" />
                                            <span>Featured Jobs: <b>{pkg.limit_featured_jobs ?? 0}</b></span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Search className="w-4 h-4 text-primary" />
                                            <span>Jobsuche: {pkg.can_search_jobs ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            <span>Bewerbungen: <b>{pkg.limit_applications ?? 'Unbegrenzt'}</b></span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>Laufzeit: <b>{pkg.duration_days ?? 365} Tage</b></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pakete & Preise verwalten</h1>
                        <p className="text-muted-foreground">Hier können Sie die Konditionen für Talente und Arbeitgeber festlegen.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue="employer" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="employer">Arbeitgeber</TabsTrigger>
                            <TabsTrigger value="candidate">Talente</TabsTrigger>
                        </TabsList>
                        <TabsContent value="employer">
                            {renderPackageGrid('employer')}
                        </TabsContent>
                        <TabsContent value="candidate">
                            {renderPackageGrid('candidate')}
                        </TabsContent>
                    </Tabs>
                )}

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>Paket bearbeiten: {editingPackage?.name}</DialogTitle>
                            <DialogDescription>
                                Passen Sie die Limits und Preise für dieses Paket an.
                            </DialogDescription>
                        </DialogHeader>

                        {editingPackage && (
                            <form onSubmit={handleUpdate} className="flex-1 overflow-hidden flex flex-col">
                                <ScrollArea className="flex-1 px-6">
                                    <div className="space-y-6 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={editingPackage.name}
                                                    onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="target_role">Zielgruppe</Label>
                                                <select
                                                    id="target_role"
                                                    className="w-full h-10 px-3 border rounded-md text-sm bg-background"
                                                    value={editingPackage.target_role}
                                                    onChange={e => setEditingPackage({ ...editingPackage, target_role: e.target.value })}
                                                >
                                                    <option value="employer">Arbeitgeber</option>
                                                    <option value="candidate">Talent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="price_yearly">Preis pro Jahr (€)</Label>
                                                <Input
                                                    id="price_yearly"
                                                    type="number"
                                                    value={editingPackage.price_yearly}
                                                    onChange={e => setEditingPackage({ ...editingPackage, price_yearly: parseFloat(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="duration_days">Laufzeit (Tage)</Label>
                                                <Input
                                                    id="duration_days"
                                                    type="number"
                                                    value={editingPackage.duration_days ?? 365}
                                                    onChange={e => setEditingPackage({ ...editingPackage, duration_days: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 mt-8">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="is_active"
                                                        checked={editingPackage.is_active}
                                                        onCheckedChange={checked => setEditingPackage({ ...editingPackage, is_active: checked })}
                                                    />
                                                    <Label htmlFor="is_active">Paket aktiv</Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t pt-6">
                                            <h3 className="font-semibold text-sm">Nutzungslimits (Leer lassen für unbegrenzt)</h3>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="limit_jobs">Job-Limit (Employer)</Label>
                                                    <Input
                                                        id="limit_jobs"
                                                        type="number"
                                                        placeholder="Unbegrenzt"
                                                        value={editingPackage.limit_jobs ?? ''}
                                                        onChange={e => setEditingPackage({ ...editingPackage, limit_jobs: e.target.value === '' ? null : parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="limit_contacts">Kontakt-Limit (Employer)</Label>
                                                    <Input
                                                        id="limit_contacts"
                                                        type="number"
                                                        placeholder="Unbegrenzt"
                                                        value={editingPackage.limit_contacts ?? ''}
                                                        onChange={e => setEditingPackage({ ...editingPackage, limit_contacts: e.target.value === '' ? null : parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="limit_applications">Bewerbung-Limit (Talent)</Label>
                                                    <Input
                                                        id="limit_applications"
                                                        type="number"
                                                        placeholder="Unbegrenzt"
                                                        value={editingPackage.limit_applications ?? ''}
                                                        onChange={e => setEditingPackage({ ...editingPackage, limit_applications: e.target.value === '' ? null : parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="limit_featured_jobs">Featured Jobs (Employer)</Label>
                                                    <Input
                                                        id="limit_featured_jobs"
                                                        type="number"
                                                        value={editingPackage.limit_featured_jobs ?? 0}
                                                        onChange={e => setEditingPackage({ ...editingPackage, limit_featured_jobs: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 border p-3 rounded-md">
                                                <Switch
                                                    id="can_search_jobs"
                                                    checked={editingPackage.can_search_jobs}
                                                    onCheckedChange={checked => setEditingPackage({ ...editingPackage, can_search_jobs: checked })}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor="can_search_jobs" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Aktive Jobsuche erlauben (Talent)
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Wenn deaktiviert, können Talente nur eingeladen werden.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter className="p-6 pt-2 border-t mt-auto">
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Abbrechen</Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Speichern
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
);
};

export default AdminPackages;