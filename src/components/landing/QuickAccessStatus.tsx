import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Users, Briefcase, GraduationCap, UserPlus, Clock } from 'lucide-react';

const statuses = [
    { id: 'Unemployed', label: 'Unemployed', icon: Clock },
    { id: 'Employed', label: 'Employed', icon: Briefcase },
    { id: 'Trainee', label: 'Trainee', icon: UserPlus },
    { id: 'Apprentice', label: 'Apprentice', icon: UserPlus },
    { id: 'Pupil', label: 'Pupil', icon: GraduationCap },
    { id: 'Student', label: 'Student', icon: GraduationCap },
    { id: 'Civil Servant', label: 'Civil Servant', icon: Users },
    { id: 'Freelancer', label: 'Freelancer', icon: UserPlus },
    { id: 'Entrepreneur', icon: Briefcase, label: 'Entrepreneur' },
    { id: 'Retired', label: 'Retired', icon: Clock },
    { id: 'Other', label: 'Other', icon: Users },
    { id: 'any', label: 'All Talents', icon: Users },
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
                        <Card className="p-4 h-full border border-border bg-background hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 rounded-xl shadow-none">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
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
