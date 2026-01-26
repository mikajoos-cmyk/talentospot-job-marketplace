import { supabase } from '../lib/supabase';

export const packagesService = {
  async getPackages(role?: 'candidate' | 'employer') {
    let query = supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price_amount', { ascending: true });

    if (role) {
      query = query.eq('target_role', role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getPackageById(packageId: string) {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createSubscription(userId: string, packageId: string, stripeData: any) {
    const pkg = await this.getPackageById(packageId);

    const expiresAt = new Date();
    if (pkg.billing_period === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (pkg.billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        package_id: packageId,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        stripe_subscription_id: stripeData.subscriptionId,
        stripe_customer_id: stripeData.customerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementUsage(subscriptionId: string, field: string) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) throw new Error('Subscription not found');

    const updates: any = {};
    updates[field] = (subscription[field] || 0) + 1;

    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    if (error) throw error;
  },

  async checkUsageLimit(userId: string, limitType: string) {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) return { allowed: false, reason: 'No active subscription' };

    const pkg = subscription.packages;
    const usedField = `${limitType}_used`;
    const limitField = `${limitType}_limit`;

    const used = subscription[usedField] || 0;
    const limit = pkg[limitField];

    if (limit === null) {
      return { allowed: true };
    }

    if (used >= limit) {
      return { allowed: false, reason: 'Limit reached' };
    }

    return { allowed: true };
  },
};
