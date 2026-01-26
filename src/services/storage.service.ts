import { supabase } from '../lib/supabase';

const BUCKETS = {
  AVATARS: 'avatars',
  CVS: 'cvs',
  PORTFOLIOS: 'portfolios',
  DOCUMENTS: 'documents',
  LOGOS: 'logos',
};

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadCV(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-cv-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.CVS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKETS.CVS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadPortfolioImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-portfolio-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.PORTFOLIOS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKETS.PORTFOLIOS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadDocument(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-doc-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.DOCUMENTS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKETS.DOCUMENTS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadLogo(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.LOGOS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKETS.LOGOS)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  },

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
