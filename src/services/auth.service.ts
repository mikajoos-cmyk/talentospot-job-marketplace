import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: 'candidate' | 'employer';
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
        emailRedirectTo: undefined,
      },
    });

    if (authError) {
      console.error('Signup error:', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('No user returned from signup');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        phone: data.phone || null,
        is_active: true,
        is_verified: false,
      });

    if (profileError) throw profileError;

    if (data.role === 'candidate') {
      const { error: candidateError } = await supabase
        .from('candidate_profiles')
        .insert({
          id: authData.user.id,
        });
      if (candidateError) throw candidateError;
    } else if (data.role === 'employer') {
      const { error: employerError } = await supabase
        .from('employer_profiles')
        .insert({
          id: authData.user.id,
          company_name: '',
          contact_person: data.fullName,
          contact_email: data.email,
        });
      if (employerError) throw employerError;
    }

    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
