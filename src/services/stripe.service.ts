import { supabase } from '../lib/supabase';
import { packagesService } from './packages.service';

export const stripeService = {
  async createCheckoutSession(packageId: string, userId: string) {
    const pkg = await packagesService.getPackageById(packageId);

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        packageId,
        userId,
        priceAmount: pkg.price_amount,
        currency: pkg.price_currency || 'EUR',
      },
    });

    if (error) throw error;
    return data;
  },

  async createSubscription(userId: string, packageId: string, paymentMethodId: string) {
    const pkg = await packagesService.getPackageById(packageId);

    const subscriptionData = {
      userId,
      packageId,
      paymentMethodId,
      priceAmount: pkg.price_amount,
    };

    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: subscriptionData,
    });

    if (error) throw error;

    await packagesService.createSubscription(userId, packageId, {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
    });

    return data;
  },

  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId },
    });

    if (error) throw error;

    await packagesService.cancelSubscription(subscriptionId);

    return data;
  },

  async recordPayment(userId: string, packageId: string, amount: number, paymentIntentId: string) {
    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        subscription_id: null,
        amount,
        currency: 'EUR',
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
