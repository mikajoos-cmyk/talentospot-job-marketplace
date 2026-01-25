import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';

const AppHeader: React.FC = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-6 md:px-8">
      <div className="flex items-center flex-1 space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input
            type="search"
            placeholder={user.role === 'candidate' ? 'Search jobs...' : 'Search candidates...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background text-foreground border-border focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </Button>

        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-body-sm font-medium text-foreground">{user.name}</p>
            <p className="text-caption text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
