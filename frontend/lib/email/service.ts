/**
 * Email Service with Brevo Integration
 * Sends verification emails, password reset, 2FA codes, notifications
 * @file lib/email/service.ts
 */

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_EMAIL = 'noreply@pslpulse.com';

/**
 * Email verification template
 */
function getVerificationEmailTemplate(
  userName: string,
  verificationLink: string
): EmailTemplate {
  return {
    subject: 'Verify Your PSL Pulse Account Email',
    text: `Hi ${userName},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link expires in 24 hours.\n\nIf you didn't create this account, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5a8e; }
            .content { margin: 20px 0; }
            .button { display: inline-block; background: #8b5a8e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .warning { color: #d9534f; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PSL Pulse</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Welcome to PSL Pulse! Please verify your email address to activate your account.</p>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
              <p>Or copy this link: <br/><small>${verificationLink}</small></p>
              <p class="warning">This link expires in 24 hours.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 PSL Pulse. All rights reserved.</p>
              <p>This is an automated email, please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Password reset template
 */
function getPasswordResetEmailTemplate(
  userName: string,
  resetLink: string
): EmailTemplate {
  return {
    subject: 'Reset Your PSL Pulse Password',
    text: `Hi ${userName},\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5a8e; }
            .content { margin: 20px 0; }
            .alert { background: #fcf8e3; border: 1px solid #faebcc; color: #8a6d3b; padding: 12px; border-radius: 4px; margin: 15px 0; }
            .button { display: inline-block; background: #8b5a8e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PSL Pulse</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password.</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <div class="alert">
                <strong>Security Notice:</strong> This link expires in 1 hour and can only be used once.
              </div>
              <p class="warning">If you didn't request this password reset, please <a href="${APP_URL}/account/security">secure your account immediately</a>.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 PSL Pulse. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * 2FA code template
 */
function get2FACodeEmailTemplate(userName: string, code: string): EmailTemplate {
  return {
    subject: 'Your PSL Pulse Two-Factor Authentication Code',
    text: `Hi ${userName},\n\nYour 2FA code is: ${code}\n\nThis code expires in 10 minutes. Do not share this code with anyone.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5a8e; }
            .code-box { background: #f5f5f5; border: 2px solid #8b5a8e; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; font-family: monospace; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PSL Pulse</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Your two-factor authentication code is:</p>
              <div class="code-box">${code}</div>
              <p><strong>This code expires in 10 minutes.</strong></p>
              <p style="color: #d9534f;"><strong>Do not share this code with anyone.</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 PSL Pulse. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Account deleted confirmation
 */
function getAccountDeletedTemplate(userName: string): EmailTemplate {
  return {
    subject: 'Your PSL Pulse Account Has Been Deleted',
    text: `Hi ${userName},\n\nYour account has been successfully deleted. All personal data has been removed from our servers.\n\nIf you didn't request this, please contact support immediately.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5a8e; }
            .alert { background: #f2dede; border: 1px solid #ebccd1; color: #a94442; padding: 12px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">PSL Pulse</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Your PSL Pulse account has been successfully deleted.</p>
              <div class="alert">
                <strong>Account Deletion Confirmation</strong><br/>
                All personal data, transactions, and associated information has been permanently removed from our servers.
              </div>
              <p>If you didn't request this deletion, please <a href="${APP_URL}/support">contact our support team</a> immediately.</p>
              <p>We'd be sad to see you go! Feel free to create a new account anytime.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 PSL Pulse. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Send email via Brevo
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!BREVO_API_KEY) {
    console.error('[Email] BREVO_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: APP_EMAIL, name: 'PSL Pulse' },
        to: [{ email: to }],
        subject: template.subject,
        htmlContent: template.html,
        textContent: template.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Brevo error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('[Email] Sent successfully:', { to, subject: template.subject, messageId: data.messageId });
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[Email] Send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const verificationLink = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
  const template = getVerificationEmailTemplate(userName, verificationLink);
  return sendEmail(email, template);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetLink = `${APP_URL}/auth/reset-password?token=${resetToken}`;
  const template = getPasswordResetEmailTemplate(userName, resetLink);
  return sendEmail(email, template);
}

/**
 * Send 2FA code email
 */
export async function send2FACodeEmail(
  email: string,
  userName: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const template = get2FACodeEmailTemplate(userName, code);
  return sendEmail(email, template);
}

/**
 * Send account deleted confirmation
 */
export async function sendAccountDeletedEmail(
  email: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const template = getAccountDeletedTemplate(userName);
  return sendEmail(email, template);
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FACodeEmail,
  sendAccountDeletedEmail,
};
