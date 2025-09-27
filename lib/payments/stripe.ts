import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { User, DatabaseService, supabaseAdmin } from '@/lib/supabase/database';
import { getUser } from '@/lib/auth/supabase';

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
    customer: user.stripe_customer_id || undefined,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
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

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await DatabaseService.updateUser(user.id, {
      stripe_subscription_id: subscriptionId,
      stripe_product_id: plan?.product as string,
      plan_name: (plan?.product as Stripe.Product).name,
      subscription_status: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await DatabaseService.updateUser(user.id, {
      stripe_subscription_id: null,
      stripe_product_id: null,
      plan_name: null,
      subscription_status: status
    });
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
