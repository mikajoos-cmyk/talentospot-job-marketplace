import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'candidate' | 'employer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  packageTier?: 'free' | 'basic' | 'premium';
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'candidate',
    avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
  });

  const switchRole = (role: UserRole) => {
    setUser(prev => ({
      ...prev,
      role,
      packageTier: role === 'employer' ? 'basic' : undefined,
    }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
