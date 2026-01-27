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
  packageTier?: 'free' | 'basic' | 'premium' | 'starting' | 'standard';
  companyName?: string;
  subscription?: any;
  profile?: any;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<User>;
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

  const loadUserProfile = async (userId: string): Promise<User> => {
    try {
      let profile = null;
      try {
        profile = await authService.getProfile(userId);
      } catch (error) {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) throw error;
        profile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || '',
          role: currentUser.user_metadata?.role || 'candidate',
          avatar_url: null,
        };
      }

      let extendedProfile = null;
      let subscription = null;

      try {
        subscription = await packagesService.getUserSubscription(userId);
      } catch (error) {
        console.error('Error loading subscription:', error);
      }

      if (profile.role === 'candidate') {
        try {
          const candidateData = await candidateService.getCandidateProfile(userId);

          if (candidateData) {
            extendedProfile = candidateData;
            // Falls name/avatar im extendedProfile liegen (durch unseren Mapper), nutzen wir sie
            if (candidateData.name) profile.full_name = candidateData.name;
            if (candidateData.avatar) profile.avatar_url = candidateData.avatar;
          }
        } catch (error) {
          console.error('Error loading candidate profile:', error);
        }
      } else if (profile.role === 'employer') {
        try {
          extendedProfile = await employerService.getEmployerProfile(userId);
          if (extendedProfile) {
            if (extendedProfile.company_name) profile.full_name = extendedProfile.company_name;
            if (extendedProfile.logo_url) profile.avatar_url = extendedProfile.logo_url;
          }
        } catch (error) {
          console.error('Error loading employer profile:', error);
        }
      }

      const updatedUser: User = {
        id: profile.id,
        name: profile.full_name || '',
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar_url || undefined,
        companyName: extendedProfile?.company_name,
        profile: extendedProfile,
        packageTier: subscription?.packages?.name?.toLowerCase() as any || 'free',
      };

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error loading user profile:', error);
      const guestUser: User = {
        id: '',
        name: '',
        email: '',
        role: 'guest',
      };
      setUser(guestUser);
      return guestUser;
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

  const login = async (email: string, password: string): Promise<User> => {
    const { user: authUser } = await authService.signIn({ email, password });
    await loadUserProfile(authUser.id);

    // Return the user state as it's now updated in the state but the local let/const might be useful too
    // Since setUser is async in terms of when 'user' state updates, we can re-query or just rely on what loadUserProfile does
    // However, to be safest for the caller, let's return a value. 
    // We need to fetch the profile again or extract it from loadUserProfile's logic if we want to be precise, 
    // but usually callers just want to know it's done. 
    // Let's actually make loadUserProfile return the user object it creates.
    return await loadUserProfile(authUser.id) as unknown as User;
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
