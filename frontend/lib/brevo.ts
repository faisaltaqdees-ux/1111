/**
 * ============================================================================
 * BREVO EMAIL SERVICE & TEMPLATES
 * ============================================================================
 * Complete email integration for OTP, password reset, notifications
 * Sends production emails via Brevo API
 * @file lib/brevo.ts
 * @version 1.0 - Complete Implementation (350+ lines)
 */

/**
 * ============================================================================
 * TYPES & INTERFACES (Lines 15-80)
 * ============================================================================
 */

export interface EmailTemplate {
  name: string;
  subject: string;
  htmlContent: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  attachments?: Array<{
    name: string;
    content: string;
    contentType?: string;
  }>;
}

/**
 * ============================================================================
 * BREVO API CONFIGURATION (Lines 82-110)
 * ============================================================================
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const SENDER = {
  name: 'PSL Pulse',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@pslpulse.com',
};

if (!BREVO_API_KEY) {
  console.warn(
    '⚠️  BREVO_API_KEY not configured. Emails will be logged to console only.'
  );
}

/**
 * ============================================================================
 * EMAIL TEMPLATES (Lines 112-250)
 * ============================================================================
 */

/**
 * OTP Verification Email Template
 */
export const OTP_TEMPLATE: EmailTemplate = {
  name: 'otp-verification',
  subject: 'Your PSL Pulse Verification Code',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 PSL Pulse</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Welcome to PSL Pulse! Your verification code is:
        </p>
        
        <div style="background: white; border: 2px solid #db2777; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <p style="font-size: 32px; font-weight: bold; color: #db2777; margin: 0; letter-spacing: 5px;">
            {OTP_CODE}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <ul style="color: #666; font-size: 14px; line-height: 1.8;">
          <li>✓ Never share this code with anyone</li>
          <li>✓ PSL Pulse staff will never ask for your code</li>
          <li>✓ Delete this email after verification</li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    </div>
  `,
};

/**
 * Welcome Email Template
 */
export const WELCOME_TEMPLATE: EmailTemplate = {
  name: 'welcome',
  subject: 'Welcome to PSL Pulse! Your Account is Ready',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✨ Account Created!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Hi {FULL_NAME},
        </p>
        
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Your PSL Pulse account has been successfully created and verified!
        </p>
        
        <div style="background: white; border-left: 4px solid #db2777; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #db2777; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #333; font-size: 14px; line-height: 1.8;">
            <li><strong>Connect Your Wallet</strong> - Link MetaMask to enable ticket purchases</li>
            <li><strong>Browse Events</strong> - Explore PSL cricket events</li>
            <li><strong>Buy Tickets</strong> - Purchase tickets for your favorite matches</li>
            <li><strong>Connect with Community</strong> - Tip players and stake in impact pools</li>
          </ol>
        </div>
        
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Questions? Check out our help center or reach out to support@pslpulse.com
        </p>
        
        <a href="https://pslpulse.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin-top: 20px;">
          Go to Dashboard →
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          PSL Pulse © 2026 | All rights reserved
        </p>
      </div>
    </div>
  `,
};

/**
 * Password Reset Email Template
 */
export const PASSWORD_RESET_TEMPLATE: EmailTemplate = {
  name: 'password-reset',
  subject: 'Reset Your PSL Pulse Password',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password.
        </p>
        
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        
        <a href="{RESET_LINK}" style="display: inline-block; background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0;">
          Reset Password →
        </a>
        
        <div style="background: white; border-left: 4px solid #ff7f00; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #ff7f00; font-weight: bold; margin-top: 0;">Security Notice:</p>
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            If you didn't request this password reset, please ignore this email or contact support immediately.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          PSL Pulse © 2026 | All rights reserved
        </p>
      </div>
    </div>
  `,
};

/**
 * Ticket Purchase Confirmation Email Template
 */
export const TICKET_PURCHASE_TEMPLATE: EmailTemplate = {
  name: 'ticket-purchase',
  subject: 'Ticket Purchase Confirmed - {EVENT_NAME}',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎫 Ticket Confirmed!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Your ticket purchase is confirmed!
        </p>
        
        <div style="background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Event Details</h3>
          <p style="color: #666; margin: 10px 0;"><strong>Event:</strong> {EVENT_NAME}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Date:</strong> {EVENT_DATE}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Seat:</strong> {SEAT_NUMBER}</p>
          <p style="color: #666; margin: 10px 0;"><strong>Price:</strong> {PRICE_PAID}</p>
        </div>
        
        <div style="background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin-top: 0;">📱 Your QR Code</p>
          <img src="{QR_CODE}" alt="QR Code" style="width: 200px; height: 200px;"/>
        </div>
        
        <div style="background: #e8f4f8; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #0891b2; font-weight: bold; margin-top: 0;">Pro Tip:</p>
          <p style="color: #333; font-size: 14px; margin-bottom: 0;">
            Show your ticket QR code at the entrance. You can also transfer your ticket anytime from your account.
          </p>
        </div>
        
        <p style="color: #333; font-size: 16px; margin-top: 30px; margin-bottom: 10px;">
          <a href="https://pslpulse.com/my-tickets" style="color: #db2777; text-decoration: none; font-weight: bold;">View Your Tickets →</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          PSL Pulse © 2026 | All rights reserved
        </p>
      </div>
    </div>
  `,
};

/**
 * Wallet Connected Email Template
 */
export const WALLET_CONNECTED_TEMPLATE: EmailTemplate = {
  name: 'wallet-connected',
  subject: 'Wallet Successfully Connected to Your PSL Pulse Account',
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9b1d5c 0%, #db2777 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💰 Wallet Connected!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Your wallet has been successfully connected to your PSL Pulse account.
        </p>
        
        <div style="background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #666; margin: 10px 0;"><strong>Wallet Address:</strong></p>
          <p style="color: #333; font-family: monospace; word-break: break-all; margin: 10px 0; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            {WALLET_ADDRESS}
          </p>
          <p style="color: #666; margin: 10px 0;"><strong>Provider:</strong> {WALLET_PROVIDER}</p>
        </div>
        
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          You can now:
        </p>
        
        <ul style="color: #333; font-size: 14px; line-height: 1.8;">
          <li>✓ Purchase tickets with your wallet</li>
          <li>✓ Transfer tickets to other wallets</li>
          <li>✓ Participate in impact pools</li>
          <li>✓ Tip your favorite players</li>
          <li>✓ View your transaction history</li>
        </ul>
        
        <div style="background: #fff3cd; border-left: 4px solid #ff7f00; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #ff7f00; font-weight: bold; margin-top: 0;">Security Note:</p>
          <p style="color: #333; font-size: 14px; margin-bottom: 0;">
            Keep your wallet secure. Never share your private keys or recovery phrases with anyone.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          PSL Pulse © 2026 | All rights reserved
        </p>
      </div>
    </div>
  `,
};

/**
 * ============================================================================
 * EMAIL SENDING FUNCTION (Lines 252-350)
 * ============================================================================
 */

/**
 * Send email via Brevo API
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // If no API key, just log to console (for development)
  if (!BREVO_API_KEY) {
    console.log('📧 EMAIL (CONSOLE MODE):', {
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
    });
    return { success: true, messageId: 'CONSOLE_MODE' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [
          {
            email: options.to,
            name: options.toName || 'PSL User',
          },
        ],
        subject: options.subject,
        htmlContent: options.htmlContent,
        attachments: options.attachments || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email sending error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * ============================================================================
 * SPECIALIZED EMAIL SENDING FUNCTIONS (Lines 352-450)
 * ============================================================================
 */

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, code: string): Promise<boolean> {
  const htmlContent = OTP_TEMPLATE.htmlContent.replace('{OTP_CODE}', code);

  const result = await sendEmail({
    to: email,
    subject: OTP_TEMPLATE.subject,
    htmlContent,
  });

  return result.success;
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string
): Promise<boolean> {
  const htmlContent = WELCOME_TEMPLATE.htmlContent.replace(
    '{FULL_NAME}',
    fullName
  );

  const result = await sendEmail({
    to: email,
    toName: fullName,
    subject: WELCOME_TEMPLATE.subject,
    htmlContent,
  });

  return result.success;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const htmlContent = PASSWORD_RESET_TEMPLATE.htmlContent.replace(
    '{RESET_LINK}',
    resetLink
  );

  const result = await sendEmail({
    to: email,
    subject: PASSWORD_RESET_TEMPLATE.subject,
    htmlContent,
  });

  return result.success;
}

/**
 * Send ticket purchase confirmation
 */
export async function sendTicketPurchaseEmail(
  email: string,
  ticketData: {
    eventName: string;
    eventDate: string;
    seatNumber: string;
    pricePaid: string;
    qrCodeUrl: string;
  }
): Promise<boolean> {
  let htmlContent = TICKET_PURCHASE_TEMPLATE.htmlContent
    .replace('{EVENT_NAME}', ticketData.eventName)
    .replace('{EVENT_DATE}', ticketData.eventDate)
    .replace('{SEAT_NUMBER}', ticketData.seatNumber)
    .replace('{PRICE_PAID}', ticketData.pricePaid)
    .replace('{QR_CODE}', ticketData.qrCodeUrl);

  const result = await sendEmail({
    to: email,
    subject: TICKET_PURCHASE_TEMPLATE.subject.replace(
      '{EVENT_NAME}',
      ticketData.eventName
    ),
    htmlContent,
  });

  return result.success;
}

/**
 * Send wallet connected email
 */
export async function sendWalletConnectedEmail(
  email: string,
  walletAddress: string,
  provider: string
): Promise<boolean> {
  const htmlContent = WALLET_CONNECTED_TEMPLATE.htmlContent
    .replace('{WALLET_ADDRESS}', walletAddress)
    .replace('{WALLET_PROVIDER}', provider);

  const result = await sendEmail({
    to: email,
    subject: WALLET_CONNECTED_TEMPLATE.subject,
    htmlContent,
  });

  return result.success;
}

/**
 * ============================================================================
 * END OF BREVO EMAIL MODULE (350+ lines total)
 * ============================================================================
 * FEATURES:
 * ✅ Complete Brevo API integration
 * ✅ Professional HTML email templates
 * ✅ OTP verification emails
 * ✅ Welcome emails
 * ✅ Password reset emails
 * ✅ Ticket purchase confirmations
 * ✅ Wallet connection notifications
 * ✅ Fallback to console logging (development mode)
 * ✅ Error handling
 * ✅ TypeScript support
 */
