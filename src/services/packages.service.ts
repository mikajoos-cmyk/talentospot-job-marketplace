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
      console.log(`[packagesService] Fetching subscription for user ${userId}`);
      // Holt das aktuellste Abo, das "active" ist UND noch nicht abgelaufen ist
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          packages (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[packagesService] Error fetching subscription:', error);
        return null;
      }

      console.log('[packagesService] getUserSubscription result for', userId, ':', data);
      return data;
    } catch (error) {
      console.error('[packagesService] Exception in getUserSubscription:', error);
      return null;
    }
  },

  // Ein neues Abo zuweisen (z.B. nach Stripe Payment)
  async assignPackage(userId: string, packageId: string) {
    // 1. Aktuelles Abo holen, um verbrauchte Mengen zu übernehmen
    // Wir zählen Jobs und Featured Jobs jetzt automatisch aus der DB.
    // Kontakte und Bewerbungen werden weiterhin aus dem letzten Abo übernommen,
    // da diese schwerer zu zählen sind (historische Aktionen).
    const currentSub = await this.getUserSubscription(userId);

    // 2. Tatsächliche Job-Nutzung aus der DB zählen
    let actualJobsUsed = 0;
    let actualFeaturedJobsUsed = 0;

    try {
      const { count: jobsCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('employer_id', userId)
        .eq('status', 'active');
      
      if (!jobsError) actualJobsUsed = jobsCount || 0;

      const { count: featuredCount, error: featuredError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('employer_id', userId)
        .eq('status', 'active')
        .eq('is_featured', true);
      
      if (!featuredError) actualFeaturedJobsUsed = featuredCount || 0;
    } catch (e) {
      console.error('Error counting actual usage:', e);
      // Fallback auf altes Verhalten falls Zählung fehlschlägt
      actualJobsUsed = currentSub?.jobs_used || 0;
      actualFeaturedJobsUsed = currentSub?.featured_jobs_used || 0;
    }

    // 3. Alle bestehenden aktiven Abonnements dieses Benutzers auf 'expired' setzen
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // 4. Paket-Details holen
    const { data: pkg } = await supabase.from('packages').select('*').eq('id', packageId).single();
    if (!pkg) throw new Error('Package not found');

    const expiresAt = new Date();
    // Wenn duration_days gesetzt ist (z.B. 30 Tage Free), sonst 1 Jahr
    const days = pkg.duration_days || 365;
    expiresAt.setDate(expiresAt.getDate() + days);

    // 5. Neues Abo einfügen (mit Übernahme der verbrauchten Mengen)
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        package_id: packageId,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        // Automatisch gezählte Werte für Jobs
        jobs_used: actualJobsUsed,
        featured_jobs_used: actualFeaturedJobsUsed,
        // Übernahme der Zähler für Einmal-Aktionen
        contacts_used: currentSub?.contacts_used || 0,
        applications_used: currentSub?.applications_used || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Prüft, ob eine Aktion erlaubt ist
  async checkLimit(userId: string, limitType: LimitType): Promise<{ allowed: boolean; message?: string }> {
    console.log(`[packagesService] Checking limit for user ${userId}, type ${limitType}`);
    const subscription = await this.getUserSubscription(userId);

    // Wenn kein Abo existiert -> Fallback auf Free Tier Logic oder Block
    if (!subscription) {
      console.log(`[packagesService] No active subscription found for user ${userId}`);
      return { allowed: false, message: 'Kein aktives Abonnement gefunden. Bitte wählen Sie ein Paket aus.' };
    }

    const pkg = subscription.packages;
    let used = subscription[`${limitType}_used`] || 0;
    
    // Für Jobs und Featured Jobs zählen wir LIVE die aktiven Postings,
    // damit deaktivierte Jobs den Slot wieder freigeben.
    if (limitType === 'jobs' || limitType === 'featured_jobs') {
      try {
        let query = supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('employer_id', userId)
          .eq('status', 'active');
        
        if (limitType === 'featured_jobs') {
          query = query.eq('is_featured', true);
        }

        const { count, error } = await query;
        if (!error && count !== null) {
          used = count;
          console.log(`[packagesService] Live count for ${limitType}: ${used}`);
        }
      } catch (e) {
        console.error(`[packagesService] Error live counting ${limitType}:`, e);
        // Fallback auf gespeicherten Wert
      }
    }

    const limit = pkg[`limit_${limitType}`];

    console.log(`[packagesService] User ${userId} has used ${used} of ${limit === null ? 'unlimited' : limit} for ${limitType}`);

    // NULL bedeutet "Unbegrenzt"
    if (limit === null) {
      return { allowed: true };
    }

    if (used >= limit) {
      const msg = `Limit erreicht (${used}/${limit}). Bitte upgraden Sie Ihr Paket.`;
      console.log(`[packagesService] Limit reached for user ${userId}: ${msg}`);
      return {
        allowed: false,
        message: msg
      };
    }

    return { allowed: true };
  },

  // Zählt die Nutzung hoch (nach erfolgreicher Aktion)
  async incrementUsage(userId: string, limitType: LimitType) {
    console.log(`[packagesService] Incrementing usage for user ${userId}, type ${limitType}`);
    
    // Für Jobs und Featured Jobs inkrementieren wir nicht mehr manuell,
    // da checkLimit diese Werte jetzt LIVE aus der Datenbank zählt.
    // Wir aktualisieren dennoch den Snapshot in der Subscription, damit die UI
    // (die meistens auf das Subscription-Objekt schaut) aktuell bleibt.
    
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      console.warn(`[packagesService] Cannot increment usage: No subscription found for user ${userId}`);
      return;
    }

    const field = `${limitType}_used`;
    let newVal;

    if (limitType === 'jobs' || limitType === 'featured_jobs') {
      // Snapshot aktualisieren durch Live-Count
      try {
        let query = supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('employer_id', userId)
          .eq('status', 'active');
        
        if (limitType === 'featured_jobs') {
          query = query.eq('is_featured', true);
        }

        const { count } = await query;
        newVal = count || 0;
      } catch (e) {
        newVal = (subscription[field] || 0) + 1;
      }
    } else {
      const current = subscription[field] || 0;
      newVal = current + 1;
    }

    console.log(`[packagesService] Updating ${field} to ${newVal} for subscription ${subscription.id}`);

    const { error } = await supabase
      .from('subscriptions')
      .update({ [field]: newVal })
      .eq('id', subscription.id);
    
    if (error) {
      console.error(`[packagesService] Error updating usage for ${userId}:`, error);
    } else {
      console.log(`[packagesService] Successfully updated usage for ${userId}`);
    }
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
      if (!userId) {
        console.warn('[packagesService] No userId provided to hasActivePackage');
        return false;
      }
      
      const subscription = await this.getUserSubscription(userId);

      // No subscription at all
      if (!subscription || subscription.status !== 'active') {
        console.log(`[packagesService] No active subscription for ${userId}`);
        return false;
      }

      // Check if it's a free package (by name or price)
      const packageName = subscription.packages?.name?.toLowerCase() || '';
      const packagePrice = subscription.packages?.price_amount || 0;
      const packagePriceYearly = subscription.packages?.price_yearly || 0;

      console.log(`[packagesService] Checking package for ${userId}: ${packageName}, Price Monthly: ${packagePrice}, Price Yearly: ${packagePriceYearly}`);

      // Free packages should not grant premium access
      // We check for "kostenlos" or "free" in the name, OR price 0
      const isFree = packageName.includes('kostenlos') || 
                     packageName.includes('free') || 
                     (packagePrice === 0 && packagePriceYearly === 0);

      if (isFree) {
        console.log(`[packagesService] User ${userId} has free package, denying premium features`);
        return false;
      }

      console.log(`[packagesService] User ${userId} has paid package: ${packageName}`);
      return true;
    } catch (error) {
      console.error('[packagesService] Error checking active package:', error);
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
  },

  async updatePackage(id: string, updates: any) {
    const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
  },

  async getAllPackagesForAdmin() {
    // Kein .eq('is_active', true) Filter hier!
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price_yearly', { ascending: true });

    if (error) throw error;
    return data;
  }
};

