import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    Settings,
    LogOut,
    ExternalLink,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    MessageSquare
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Falls vorhanden, sonst manuell string concat

// Interface definieren, das zu AppSidebar passt
interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors mb-1",
            isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
        );

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border transition-all duration-300", collapsed ? "w-16" : "w-64")}>
            {/* Header / Logo Bereich */}
            <div className={cn("flex items-center h-16 border-b border-border", collapsed ? "justify-center px-0" : "px-4 gap-2")}>
                <ShieldAlert className="h-6 w-6 text-primary flex-shrink-0" />
                {!collapsed && <span className="font-bold text-xl text-primary truncate">Admin Panel</span>}
            </div>

            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    <NavLink to="/admin/dashboard" className={navItemClass} title="Dashboard">
                        <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">Dashboard</span>}
                    </NavLink>

                    <NavLink to="/admin/users" className={navItemClass} title="Benutzer">
                        <Users className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">Benutzer</span>}
                    </NavLink>

                    <NavLink to="/admin/packages" className={navItemClass} title="Pakete">
                        <Package className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">Pakete</span>}
                    </NavLink>

                    <NavLink to="/admin/messages" className={navItemClass} title="Nachrichten">
                        <MessageSquare className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">Nachrichten</span>}
                    </NavLink>

                    <NavLink to="/admin/settings" className={navItemClass} title="Einstellungen">
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="ml-3">Einstellungen</span>}
                    </NavLink>

                    <div className="pt-4 mt-4 border-t border-border">
                        {!collapsed && (
                            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                System
                            </p>
                        )}
                        <NavLink to="/jobs" className={navItemClass} title="Jobsuche (Public)">
                            <ExternalLink className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="ml-3">Public Jobs</span>}
                        </NavLink>
                        <NavLink to="/candidates" className={navItemClass} title="Talentsuche (Public)">
                            <ExternalLink className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="ml-3">Public Talents</span>}
                        </NavLink>
                    </div>
                </nav>
            </ScrollArea>

            {/* Footer mit Logout und Collapse Button */}
            <div className="p-4 border-t border-border space-y-2">
                <Button
                    variant="outline"
                    className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                    onClick={handleLogout}
                    title="Abmelden"
                >
                    <LogOut className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")} />
                    {!collapsed && "Abmelden"}
                </Button>

                {/* Toggle Button nur Desktop */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 hidden lg:flex items-center justify-center text-muted-foreground"
                    onClick={onToggle}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};

export default AdminSidebar;