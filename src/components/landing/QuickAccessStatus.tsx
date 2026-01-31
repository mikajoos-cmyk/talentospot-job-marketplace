import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, GraduationCap, UserPlus, Clock } from 'lucide-react';

const statuses = [
    { id: 'unemployed', label: 'Unemployed', icon: Clock, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { id: 'employed', label: 'Employed', icon: Briefcase, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { id: 'apprentice', label: 'Apprentice', icon: UserPlus, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { id: 'any', label: 'All Talents', icon: Users, color: 'bg-primary', bgColor: 'bg-primary/10' },
];

const QuickAccessStatus = () => {
    const navigate = useNavigate();

    const handleStatusClick = (statusId: string) => {
        const params = new URLSearchParams();
        if (statusId !== 'any') {
            params.set('status', statusId);
        }
        navigate(`/candidates?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {statuses.map((status) => (
                    <button
                        key={status.id}
                        onClick={() => handleStatusClick(status.id)}
                        className="group outline-none"
                    >
                        <Card className={`p-4 h-full border-none shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 ${status.bgColor} group-hover:-translate-y-1 group-active:scale-95`}>
                            <div className={`w-12 h-12 rounded-full ${status.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <status.icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {status.label}
                            </span>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickAccessStatus;
