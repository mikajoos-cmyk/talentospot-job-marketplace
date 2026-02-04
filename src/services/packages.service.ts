import { supabase } from '../lib/supabase';

export type LimitType = 'jobs' | 'contacts' | 'featured_jobs' | 'applications';

export const packagesService = {
  // Alle Pakete laden (für Pricing Page & Admin Panel)
  async getPackages(role?: 'candidate' | 'employer') {
    let query = supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price_yearly', { ascending: true });

    if (role) {
      query = query.eq('target_role', role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Aktives Abo des Users holen
  async getUserSubscription(userId: string) {
    try {
      // Holt das Abo, das "active" ist UND noch nicht abgelaufen ist
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          packages (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      console.log('getUserSubscription result for', userId, ':', data);
      return data;
    } catch (error) {
      console.error('Exception in getUserSubscription:', error);
      return null;
    }
  },

  // Ein neues Abo zuweisen (z.B. nach Stripe Payment)
  async assignPackage(userId: string, packageId: string) {
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', packageId).single();
    if (!pkg) throw new Error('Package not found');

    const expiresAt = new Date();
    // Wenn duration_days gesetzt ist (z.B. 30 Tage Free), sonst 1 Jahr
    const days = pkg.duration_days || 365;
    expiresAt.setDate(expiresAt.getDate() + days);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        package_id: packageId,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        // Reset counters
        jobs_used: 0,
        contacts_used: 0,
        featured_jobs_used: 0,
        applications_used: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Prüft, ob eine Aktion erlaubt ist
  async checkLimit(userId: string, limitType: LimitType): Promise<{ allowed: boolean; message?: string }> {
    const subscription = await this.getUserSubscription(userId);

    // Wenn kein Abo existiert -> Fallback auf Free Tier Logic oder Block
    if (!subscription) {
      // Option: Automatisch Free-Paket zuweisen oder blockieren. 
      // Hier: Blockieren, User muss ein Paket wählen.
      return { allowed: false, message: 'Kein aktives Abonnement gefunden.' };
    }

    const pkg = subscription.packages;
    const used = subscription[`${limitType}_used`] || 0;
    const limit = pkg[`limit_${limitType}`];

    // NULL bedeutet "Unbegrenzt"
    if (limit === null) {
      return { allowed: true };
    }

    if (used >= limit) {
      return {
        allowed: false,
        message: `Limit erreicht (${used}/${limit}). Bitte upgraden Sie Ihr Paket.`
      };
    }

    return { allowed: true };
  },

  // Zählt die Nutzung hoch (nach erfolgreicher Aktion)
  async incrementUsage(userId: string, limitType: LimitType) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return;

    const field = `${limitType}_used`;
    const current = subscription[field] || 0;

    await supabase
      .from('subscriptions')
      .update({ [field]: current + 1 })
      .eq('id', subscription.id);
  },

  // Speziell für Suche (Talente)
  async canSearch(userId: string): Promise<boolean> {
    const sub = await this.getUserSubscription(userId);
    // Wenn kein Abo oder can_search_jobs false ist
    if (!sub || sub.packages?.can_search_jobs === false) return false;
    return true;
  },

  // Check if user has an active package (not free tier)
  async hasActivePackage(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);

      // No subscription at all
      if (!subscription || subscription.status !== 'active') {
        return false;
      }

      // Check if it's a free package (by name or price)
      const packageName = subscription.packages?.name?.toLowerCase() || '';
      const packagePrice = subscription.packages?.price_amount || 0;

      // Free packages should not grant premium access
      if (packageName.includes('kostenlos') || packageName.includes('free') || packagePrice === 0) {
        console.log('User has free package, denying premium features');
        return false;
      }

      console.log('User has paid package:', packageName);
      return true;
    } catch (error) {
      console.error('Error checking active package:', error);
      return false;
    }
  },

  // Check if user can send messages
  async canSendMessages(userId: string): Promise<boolean> {
    return await this.hasActivePackage(userId);
  },

  // Check if user can send attachments
  async canSendAttachments(userId: string): Promise<boolean> {
    return await this.hasActivePackage(userId);
  },

  // Check if user can view shortlist details (employer)
  async canViewShortlistDetails(userId: string): Promise<boolean> {
    return await this.hasActivePackage(userId);
  },

  // Check if user can view saved jobs details (candidate)
  async canViewSavedJobsDetails(userId: string): Promise<boolean> {
    return await this.hasActivePackage(userId);
  },

  // Check if user can view contact details
  async canViewContactDetails(userId: string): Promise<boolean> {
    return await this.hasActivePackage(userId);
  }
};
