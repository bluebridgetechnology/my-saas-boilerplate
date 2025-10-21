import { emailService } from './email-service';
import { EmailTemplates } from './templates';
import { supabaseAdmin } from '@/lib/supabase/database';
import { config } from '@/lib/config';

export interface NotificationContext {
  userId: string;
  userEmail: string;
  userName: string;
}

export class NotificationService {
  static async sendSubscriptionExpiringNotification(
    context: NotificationContext,
    data: {
      expiryDate: Date;
      planName: string;
    }
  ) {
    try {
      const template = EmailTemplates.subscriptionExpiring({
        userName: context.userName,
        expiryDate: data.expiryDate.toLocaleDateString(),
        planName: data.planName,
        renewalUrl: `${config.app.url}/pricing`,
      });

      const success = await emailService.sendEmail({
        to: context.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        // Log notification in database
        await this.logNotification({
          userId: context.userId,
          type: 'subscription_expiring',
          channel: 'email',
          status: 'sent',
          metadata: {
            expiryDate: data.expiryDate.toISOString(),
            planName: data.planName,
          },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to send subscription expiring notification:', error);
      return false;
    }
  }

  static async sendSubscriptionExpiredNotification(
    context: NotificationContext,
    data: {
      planName: string;
    }
  ) {
    try {
      const template = EmailTemplates.subscriptionExpired({
        userName: context.userName,
        planName: data.planName,
        renewalUrl: `${config.app.url}/pricing`,
      });

      const success = await emailService.sendEmail({
        to: context.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        await this.logNotification({
          userId: context.userId,
          type: 'subscription_expired',
          channel: 'email',
          status: 'sent',
          metadata: {
            planName: data.planName,
          },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to send subscription expired notification:', error);
      return false;
    }
  }

  static async sendBatchProcessCompleteNotification(
    context: NotificationContext,
    data: {
      batchId: string;
      processedCount: number;
      successCount: number;
      failedCount: number;
      downloadUrl?: string;
      processingTime: string;
    }
  ) {
    try {
      const template = EmailTemplates.batchProcessComplete({
        userName: context.userName,
        batchId: data.batchId,
        processedCount: data.processedCount,
        successCount: data.successCount,
        failedCount: data.failedCount,
        downloadUrl: data.downloadUrl,
        processingTime: data.processingTime,
      });

      const success = await emailService.sendEmail({
        to: context.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        await this.logNotification({
          userId: context.userId,
          type: 'batch_process_complete',
          channel: 'email',
          status: 'sent',
          metadata: {
            batchId: data.batchId,
            processedCount: data.processedCount,
            successCount: data.successCount,
            failedCount: data.failedCount,
          },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to send batch process complete notification:', error);
      return false;
    }
  }

  static async sendPaymentFailedNotification(
    context: NotificationContext,
    data: {
      planName: string;
      amount: string;
      nextRetryDate: Date;
    }
  ) {
    try {
      const template = EmailTemplates.paymentFailed({
        userName: context.userName,
        planName: data.planName,
        amount: data.amount,
        nextRetryDate: data.nextRetryDate.toLocaleDateString(),
        updatePaymentUrl: `${config.app.url}/dashboard/billing`,
      });

      const success = await emailService.sendEmail({
        to: context.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        await this.logNotification({
          userId: context.userId,
          type: 'payment_failed',
          channel: 'email',
          status: 'sent',
          metadata: {
            planName: data.planName,
            amount: data.amount,
            nextRetryDate: data.nextRetryDate.toISOString(),
          },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to send payment failed notification:', error);
      return false;
    }
  }

  static async sendWelcomeNotification(
    context: NotificationContext
  ) {
    try {
      const template = EmailTemplates.welcome({
        userName: context.userName,
        dashboardUrl: `${config.app.url}/dashboard`,
      });

      const success = await emailService.sendEmail({
        to: context.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (success) {
        await this.logNotification({
          userId: context.userId,
          type: 'welcome',
          channel: 'email',
          status: 'sent',
          metadata: {},
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
      return false;
    }
  }

  private static async logNotification(data: {
    userId: string;
    type: string;
    channel: string;
    status: string;
    metadata: Record<string, any>;
  }) {
    try {
      // Try to log to notifications table if it exists
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          channel: data.channel,
          status: data.status,
          metadata: data.metadata,
          sent_at: new Date().toISOString(),
        });
    } catch (error) {
      // If notifications table doesn't exist, just log to console
      console.log('Notification sent:', data);
    }
  }

  static async checkSubscriptionExpiry() {
    try {
      // Find subscriptions expiring in the next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email, name, plan_name, subscription_status')
        .eq('subscription_status', 'active')
        .not('plan_name', 'is', null);

      if (!users) return;

      for (const user of users) {
        // This is a simplified check - in a real implementation, you'd check actual subscription end dates
        // For now, we'll use this as a placeholder for the cron job structure
        console.log(`Checking expiry for user ${user.email}`);
      }
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
    }
  }
}
