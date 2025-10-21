import { config } from '@/lib/config';

export interface EmailTemplateData {
  [key: string]: any;
}

export class EmailTemplates {
  static subscriptionExpiring(data: {
    userName: string;
    expiryDate: string;
    planName: string;
    renewalUrl: string;
  }) {
    return {
      subject: `Your ${config.app.name} subscription expires soon`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Expiring</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.app.name}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #e74c3c; margin-top: 0;">⚠️ Your subscription expires soon</h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Your <strong>${data.planName}</strong> subscription will expire on <strong>${data.expiryDate}</strong>.</p>
            
            <p>To continue enjoying all the premium features of ${config.app.name}, please renew your subscription before it expires.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.renewalUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Renew Subscription</a>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The ${config.app.name} Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Your ${config.app.name} subscription expires soon
        
        Hi ${data.userName},
        
        Your ${data.planName} subscription will expire on ${data.expiryDate}.
        
        To continue enjoying all the premium features, please renew your subscription: ${data.renewalUrl}
        
        Best regards,
        The ${config.app.name} Team
      `
    };
  }

  static subscriptionExpired(data: {
    userName: string;
    planName: string;
    renewalUrl: string;
  }) {
    return {
      subject: `Your ${config.app.name} subscription has expired`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Expired</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.app.name}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #e74c3c; margin-top: 0;">❌ Your subscription has expired</h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Your <strong>${data.planName}</strong> subscription has expired. You now have access to our free tier features.</p>
            
            <p>To regain access to all premium features, please reactivate your subscription.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.renewalUrl}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reactivate Subscription</a>
            </div>
            
            <p>We hope to see you back soon!</p>
            
            <p>Best regards,<br>The ${config.app.name} Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Your ${config.app.name} subscription has expired
        
        Hi ${data.userName},
        
        Your ${data.planName} subscription has expired. You now have access to our free tier features.
        
        To regain access to all premium features, please reactivate: ${data.renewalUrl}
        
        Best regards,
        The ${config.app.name} Team
      `
    };
  }

  static batchProcessComplete(data: {
    userName: string;
    batchId: string;
    processedCount: number;
    successCount: number;
    failedCount: number;
    downloadUrl?: string;
    processingTime: string;
  }) {
    return {
      subject: `Batch processing complete - ${data.successCount}/${data.processedCount} images processed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Batch Processing Complete</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.app.name}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #27ae60; margin-top: 0;">✅ Batch processing complete!</h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Your batch processing job <strong>#${data.batchId}</strong> has been completed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <h3 style="margin-top: 0; color: #2c3e50;">Processing Summary</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Total Images:</strong> ${data.processedCount}</li>
                <li style="margin: 10px 0; color: #27ae60;"><strong>Successfully Processed:</strong> ${data.successCount}</li>
                ${data.failedCount > 0 ? `<li style="margin: 10px 0; color: #e74c3c;"><strong>Failed:</strong> ${data.failedCount}</li>` : ''}
                <li style="margin: 10px 0;"><strong>Processing Time:</strong> ${data.processingTime}</li>
              </ul>
            </div>
            
            ${data.downloadUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.downloadUrl}" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Download Processed Images</a>
            </div>
            ` : ''}
            
            <p>Thank you for using ${config.app.name}!</p>
            
            <p>Best regards,<br>The ${config.app.name} Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Batch processing complete!
        
        Hi ${data.userName},
        
        Your batch processing job #${data.batchId} has been completed.
        
        Processing Summary:
        - Total Images: ${data.processedCount}
        - Successfully Processed: ${data.successCount}
        ${data.failedCount > 0 ? `- Failed: ${data.failedCount}` : ''}
        - Processing Time: ${data.processingTime}
        
        ${data.downloadUrl ? `Download your processed images: ${data.downloadUrl}` : ''}
        
        Thank you for using ${config.app.name}!
        
        Best regards,
        The ${config.app.name} Team
      `
    };
  }

  static paymentFailed(data: {
    userName: string;
    planName: string;
    amount: string;
    nextRetryDate: string;
    updatePaymentUrl: string;
  }) {
    return {
      subject: `Payment failed for your ${config.app.name} subscription`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.app.name}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #e74c3c; margin-top: 0;">⚠️ Payment failed</h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>We were unable to process the payment of <strong>${data.amount}</strong> for your <strong>${data.planName}</strong> subscription.</p>
            
            <p>We'll automatically retry the payment on <strong>${data.nextRetryDate}</strong>. To avoid any service interruption, please update your payment method.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.updatePaymentUrl}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Update Payment Method</a>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The ${config.app.name} Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Payment failed for your ${config.app.name} subscription
        
        Hi ${data.userName},
        
        We were unable to process the payment of ${data.amount} for your ${data.planName} subscription.
        
        We'll automatically retry the payment on ${data.nextRetryDate}. To avoid service interruption, please update your payment method: ${data.updatePaymentUrl}
        
        Best regards,
        The ${config.app.name} Team
      `
    };
  }

  static welcome(data: {
    userName: string;
    dashboardUrl: string;
  }) {
    return {
      subject: `Welcome to ${config.app.name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${config.app.name}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #27ae60; margin-top: 0;">🎉 Welcome to ${config.app.name}!</h2>
            
            <p>Hi ${data.userName},</p>
            
            <p>Welcome to ${config.app.name}! We're excited to have you on board.</p>
            
            <p>You can now start using our powerful image processing tools to resize, compress, convert, and enhance your images.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
            </div>
            
            <p>If you have any questions, our support team is here to help!</p>
            
            <p>Best regards,<br>The ${config.app.name} Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to ${config.app.name}!
        
        Hi ${data.userName},
        
        Welcome to ${config.app.name}! We're excited to have you on board.
        
        You can now start using our powerful image processing tools.
        
        Get started: ${data.dashboardUrl}
        
        Best regards,
        The ${config.app.name} Team
      `
    };
  }
}
