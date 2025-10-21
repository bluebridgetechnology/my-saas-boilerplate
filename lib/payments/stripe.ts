import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { User, DatabaseService, supabaseAdmin } from '@/lib/supabase/database';
import { getUser } from '@/lib/auth/supabase';
import { NotificationService } from '@/lib/email/notification-service';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Using placeholder key. Please set STRIPE_SECRET_KEY in your environment variables.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil'
});

export async function createCheckoutSession({
  user,
  priceId
}: {
  user: User | null;
  priceId: string;
}) {
  const currentUser = await getUser();

  if (!user || !currentUser) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Create or get Stripe customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        user_id: user.id
      }
    });
    customerId = customer.id;
    
    // Update user with customer ID
    await DatabaseService.updateUser(user.id, {
      stripe_customer_id: customerId
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: customerId,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan_type: 'pro'
      }
    },
    metadata: {
      user_id: user.id,
      upgrade_source: 'checkout'
    }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(user: User) {
  if (!user.stripe_customer_id || !user.stripe_product_id) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(user.stripe_product_id);
    if (!product.active) {
      throw new Error("User's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the user's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  // Find user by Stripe customer ID
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .limit(1);

  if (!users || users.length === 0) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  const user = users[0];
  const notificationContext = {
    userId: user.id,
    userEmail: user.email,
    userName: user.name || user.email.split('@')[0],
  };

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    const planName = plan?.nickname || 'Pro';
    
    await DatabaseService.updateUser(user.id, {
      stripe_subscription_id: subscriptionId,
      stripe_product_id: plan?.product as string,
      plan_name: planName,
      subscription_status: status
    });

    // Send welcome notification for new subscriptions
    if (status === 'active' && !user.stripe_subscription_id) {
      await NotificationService.sendWelcomeNotification(notificationContext);
    }
  } else if (status === 'canceled' || status === 'unpaid') {
    const previousPlanName = user.plan_name || 'Pro';
    
    await DatabaseService.updateUser(user.id, {
      stripe_subscription_id: undefined,
      stripe_product_id: undefined,
      plan_name: undefined,
      subscription_status: status
    });

    // Send subscription expired notification
    await NotificationService.sendSubscriptionExpiredNotification(
      notificationContext,
      { planName: previousPlanName }
    );
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}

// New Pro tier management functions
export async function upgradeUserToPro(userId: string, subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const plan = subscription.items.data[0]?.plan;
    
    if (!plan) {
      throw new Error('No plan found in subscription');
    }

    await DatabaseService.updateUser(userId, {
      stripe_subscription_id: subscriptionId,
      stripe_product_id: plan.product as string,
      plan_name: 'Pro',
      subscription_status: subscription.status,
      ...(subscription.trial_end && { subscription_trial_end: new Date(subscription.trial_end * 1000).toISOString() })
    });

    // Track upgrade conversion
    const user = await DatabaseService.getUser(userId);
    if (user) {
      // UsageTracker.trackUpgradeConversion(userId, 'manual_upgrade', 'monthly');
    }

    return { success: true };
  } catch (error) {
    console.error('Error upgrading user to Pro:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function downgradeUserToFree(userId: string) {
  try {
    await DatabaseService.updateUser(userId, {
      stripe_subscription_id: undefined,
      stripe_product_id: undefined,
      plan_name: 'Free',
      subscription_status: 'canceled'
    });

    return { success: true };
  } catch (error) {
    console.error('Error downgrading user to Free:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function reactivateSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    return { success: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      customer: {
        id: customer.id,
        email: (customer as any).email,
        name: (customer as any).name
      },
      plan: subscription.items.data[0]?.plan
    };
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
}

export async function createUsageRecord(subscriptionId: string, quantity: number) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItem = subscription.items.data[0];
    
    if (!subscriptionItem) {
      throw new Error('No subscription item found');
    }

    await (stripe.subscriptionItems as any).createUsageRecord(subscriptionItem.id, {
      quantity: quantity,
      timestamp: Math.floor(Date.now() / 1000)
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating usage record:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
