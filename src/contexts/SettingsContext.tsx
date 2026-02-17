import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsContextType {
    contentMaxWidth: string;
    searchMaxWidth: string;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contentMaxWidth, setContentMaxWidth] = useState('max-w-7xl');
    const [searchMaxWidth, setSearchMaxWidth] = useState('max-w-[1600px]');

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('key', ['content_max_width', 'search_max_width']);

            if (!error && data) {
                const maxWidth = data.find(s => s.key === 'content_max_width');
                if (maxWidth) setContentMaxWidth(maxWidth.value);

                const sMaxWidth = data.find(s => s.key === 'search_max_width');
                if (sMaxWidth) setSearchMaxWidth(sMaxWidth.value);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = async () => {
        await fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ contentMaxWidth, searchMaxWidth, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};
