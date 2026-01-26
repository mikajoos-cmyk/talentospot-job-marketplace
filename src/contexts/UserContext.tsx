import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { candidateService } from '../services/candidate.service';
import { employerService } from '../services/employer.service';
import { packagesService } from '../services/packages.service';

type UserRole = 'guest' | 'candidate' | 'employer' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  packageTier?: 'free' | 'basic' | 'premium';
  companyName?: string;
  subscription?: any;
  profile?: any;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'guest',
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user.role !== 'guest';

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getProfile(userId);

      let extendedProfile = null;
      let subscription = null;

      try {
        subscription = await packagesService.getUserSubscription(userId);
      } catch (error) {
        console.error('Error loading subscription:', error);
      }

      if (profile.role === 'candidate') {
        try {
          extendedProfile = await candidateService.getCandidateProfile(userId);
        } catch (error) {
          console.error('Error loading candidate profile:', error);
        }
      } else if (profile.role === 'employer') {
        try {
          extendedProfile = await employerService.getEmployerProfile(userId);
        } catch (error) {
          console.error('Error loading employer profile:', error);
        }
      }

      setUser({
        id: profile.id,
        name: profile.full_name || '',
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url || undefined,
        companyName: extendedProfile?.company_name,
        subscription,
        profile: extendedProfile,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser({
        id: '',
        name: '',
        email: '',
        role: 'guest',
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();

        if (currentUser) {
          await loadUserProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser({
          id: '',
          name: '',
          email: '',
          role: 'guest',
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authService.signIn({ email, password });
    await loadUserProfile(authUser.id);
  };

  const logout = async () => {
    await authService.signOut();
    setUser({
      id: '',
      name: '',
      email: '',
      role: 'guest',
    });
  };

  const refreshUser = async () => {
    if (user.id) {
      await loadUserProfile(user.id);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, isAuthenticated, loading, refreshUser }}>
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
