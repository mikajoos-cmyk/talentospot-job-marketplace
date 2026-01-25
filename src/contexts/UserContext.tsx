import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'guest' | 'candidate' | 'employer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  packageTier?: 'free' | 'basic' | 'premium';
  companyName?: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'guest',
  });

  const isAuthenticated = user.role !== 'guest';

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (role === 'candidate') {
      setUser({
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'candidate',
        avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
      });
    } else if (role === 'employer') {
      setUser({
        id: '2',
        name: 'Jane Smith',
        email: email,
        role: 'employer',
        packageTier: 'basic',
        companyName: 'TechCorp Inc.',
        avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
      });
    }
  };

  const logout = () => {
    setUser({
      id: '',
      name: '',
      email: '',
      role: 'guest',
    });
  };

  const switchRole = (role: UserRole) => {
    if (role === 'guest') {
      logout();
      return;
    }

    setUser(prev => ({
      ...prev,
      role,
      packageTier: role === 'employer' ? 'basic' : undefined,
    }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, switchRole, login, logout, isAuthenticated }}>
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
