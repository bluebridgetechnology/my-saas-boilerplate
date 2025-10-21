import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';
import { NotificationService } from '@/lib/email/notification-service';

export async function POST(request: NextRequest) {
  try {
    // Verify cron job authorization (you can add a secret token here)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting subscription expiry check...');

    // Get current date and dates for checking
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    let notificationsSent = 0;
    let errors = 0;

    // Check for subscriptions expiring in 7 days (first warning)
    try {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email, name, plan_name, subscription_status, stripe_subscription_id')
        .eq('subscription_status', 'active')
        .not('stripe_subscription_id', 'is', null);

      if (users) {
        for (const user of users) {
          try {
            // In a real implementation, you would:
            // 1. Fetch the actual subscription from Stripe to get the current_period_end
            // 2. Check if it's expiring in 7 days or 1 day
            // 3. Check if we've already sent a notification recently
            
            // For this example, we'll simulate the check
            const shouldSendSevenDayWarning = Math.random() < 0.1; // 10% chance for demo
            const shouldSendOneDayWarning = Math.random() < 0.05; // 5% chance for demo

            if (shouldSendSevenDayWarning) {
              const success = await NotificationService.sendSubscriptionExpiringNotification(
                {
                  userId: user.id,
                  userEmail: user.email,
                  userName: user.name || user.email.split('@')[0],
                },
                {
                  expiryDate: sevenDaysFromNow,
                  planName: user.plan_name || 'Pro',
                }
              );

              if (success) {
                notificationsSent++;
              } else {
                errors++;
              }
            }

            if (shouldSendOneDayWarning) {
              const success = await NotificationService.sendSubscriptionExpiringNotification(
                {
                  userId: user.id,
                  userEmail: user.email,
                  userName: user.name || user.email.split('@')[0],
                },
                {
                  expiryDate: oneDayFromNow,
                  planName: user.plan_name || 'Pro',
                }
              );

              if (success) {
                notificationsSent++;
              } else {
                errors++;
              }
            }
          } catch (error) {
            console.error(`Error processing user ${user.id}:`, error);
            errors++;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users for subscription check:', error);
      return NextResponse.json({ error: 'Failed to check subscriptions' }, { status: 500 });
    }

    console.log(`Subscription check completed. Notifications sent: ${notificationsSent}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in subscription check cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Subscription check cron job endpoint',
    usage: 'POST to this endpoint to trigger subscription expiry checks',
    note: 'This should be called by a cron service like Vercel Cron or GitHub Actions',
  });
}
