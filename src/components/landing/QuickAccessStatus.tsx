import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, GraduationCap, UserPlus, Clock } from 'lucide-react';

const statuses = [
    { id: 'Unemployed', label: 'Unemployed', icon: Clock, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { id: 'Employed', label: 'Employed', icon: Briefcase, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { id: 'Trainee', label: 'Trainee', icon: UserPlus, color: 'bg-indigo-500', bgColor: 'bg-indigo-50' },
    { id: 'Apprentice', label: 'Apprentice', icon: UserPlus, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { id: 'Pupil', label: 'Pupil', icon: GraduationCap, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'Student', label: 'Student', icon: GraduationCap, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { id: 'Civil Servant', label: 'Civil Servant', icon: Users, color: 'bg-slate-500', bgColor: 'bg-slate-50' },
    { id: 'Freelancer', label: 'Freelancer', icon: UserPlus, color: 'bg-pink-500', bgColor: 'bg-pink-50' },
    { id: 'Entrepreneur', icon: Briefcase, label: 'Entrepreneur', color: 'bg-cyan-500', bgColor: 'bg-cyan-50' },
    { id: 'Retired', label: 'Retired', icon: Clock, color: 'bg-red-500', bgColor: 'bg-red-50' },
    { id: 'Other', label: 'Other', icon: Users, color: 'bg-gray-500', bgColor: 'bg-gray-50' },
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
        <div className="w-full max-w-6xl mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {statuses.map((status) => (
                    <button
                        key={status.id}
                        onClick={() => handleStatusClick(status.id)}
                        className="group outline-none"
                    >
                        <Card className={`p-4 h-full border-none shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 ${status.bgColor} group-hover:-translate-y-1 group-active:scale-95`}>
                            <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <status.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
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
