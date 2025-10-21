import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/email/notification-service';
import { supabaseAdmin } from '@/lib/supabase/database';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubId = (invoice as any).subscription;
      if (invoiceSubId && typeof invoiceSubId === 'string') {
        const subscription = await stripe.subscriptions.retrieve(invoiceSubId);
        await handleSubscriptionChange(subscription);
      }
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      const failedInvoiceSubId = (failedInvoice as any).subscription;
      if (failedInvoiceSubId && typeof failedInvoiceSubId === 'string') {
        const subscription = await stripe.subscriptions.retrieve(failedInvoiceSubId);
        await handleSubscriptionChange(subscription);
        
        // Send payment failed notification
        const customerId = failedInvoice.customer as string;
        const { data: users } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .limit(1);

        if (users && users.length > 0) {
          const user = users[0];
          const nextRetryDate = new Date();
          nextRetryDate.setDate(nextRetryDate.getDate() + 3); // Stripe typically retries after 3 days

          await NotificationService.sendPaymentFailedNotification(
            {
              userId: user.id,
              userEmail: user.email,
              userName: user.name || user.email.split('@')[0],
            },
            {
              planName: user.plan_name || 'Pro',
              amount: `$${(failedInvoice.amount_due / 100).toFixed(2)}`,
              nextRetryDate,
            }
          );
        }
      }
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await handleSubscriptionChange(subscription);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
