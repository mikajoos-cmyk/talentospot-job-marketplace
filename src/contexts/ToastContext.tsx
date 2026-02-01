import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

import { toast } from '@/hooks/use-toast';

interface ToastContextType {
  showToast: (message: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = (message: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
    toast({
      title: message.title,
      description: message.description,
      variant: message.variant,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
