import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, Ban, Undo2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    status: string;
}

const AdminUsers: React.FC = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            showToast({ title: 'Fehler', description: 'Benutzer konnten nicht geladen werden', variant: 'destructive' });
        } else {
            setUsers(data as any || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBan = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        const { data, error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', userId)
            .select('id, status');

        if (error) {
            // Zeige die konkrete Fehlermeldung (z. B. RLS/Policy-Fehler) an
            showToast({
                title: 'Fehler',
                description: error.message || 'Status konnte nicht geändert werden',
                variant: 'destructive'
            });
        } else {
            // Optional: Optimistisches Update der lokalen Liste, falls Select keine Zeilen zurückliefert
            if (!data || data.length === 0) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            }
            showToast({ title: 'Erfolg', description: `Benutzer ist nun ${newStatus}` });
            // Zur Sicherheit neu laden, um DB-Realität zu spiegeln
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Name oder Email suchen..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-12 px-4 text-left font-medium">Name</th>
                                    <th className="h-12 px-4 text-left font-medium">Email</th>
                                    <th className="h-12 px-4 text-left font-medium">Rolle</th>
                                    <th className="h-12 px-4 text-left font-medium">Status</th>
                                    <th className="h-12 px-4 text-right font-medium">Aktionen</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Laden...</td></tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-medium">
                                          <Link
                                            to={user.role === 'employer' ? `/companies/${user.id}` : `/candidates/${user.id}`}
                                            className="text-primary hover:underline"
                                          >
                                            {user.full_name || 'Unbekannt'}
                                          </Link>
                                        </td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'employer' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                                        </td>
                                        <td className="p-4">
                         <span className={user.status === 'banned' ? 'text-red-500 font-medium' : 'text-green-600'}>
                           {user.status || 'active'}
                         </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleToggleBan(user.id, user.status)}>
                                                        {user.status === 'banned' ? (
                                                            <><Undo2 className="mr-2 h-4 w-4" /> Entbannen</>
                                                        ) : (
                                                            <><Ban className="mr-2 h-4 w-4" /> Bannen</>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminUsers;