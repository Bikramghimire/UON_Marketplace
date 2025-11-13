import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create email transporter
 * Supports Gmail, SMTP, and development mode (console logging)
 */
const createTransporter = () => {
  // Development mode - just log emails to console
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    return {
      sendMail: async (options) => {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('EMAIL (Development Mode - Not Sent)');
        console.log('═══════════════════════════════════════════════════');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('\nBody:');
        console.log(options.html || options.text);
        console.log('═══════════════════════════════════════════════════\n');
        return { messageId: 'dev-mode' };
      }
    };
  }

  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  // SMTP configuration
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Default: development mode
  return {
    sendMail: async (options) => {
      console.log('\n═══════════════════════════════════════════════════');
      console.log('EMAIL (Development Mode - Not Sent)');
      console.log('═══════════════════════════════════════════════════');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('\nBody:');
      console.log(options.html || options.text);
      console.log('═══════════════════════════════════════════════════\n');
      return { messageId: 'dev-mode' };
    }
  };
};

/**
 * Send email verification email with code
 */
export const sendVerificationEmail = async (user, verificationCode) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Lifecycle Marketplace" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - Lifecycle Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Lifecycle Marketplace</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            <p>Hi ${user.firstName || user.username},</p>
            <p>Thank you for registering with Lifecycle Marketplace! Please verify your email address using the verification code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; border: 3px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">
              Enter this code on the verification page to complete your registration.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Go to Verification Page
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This code will expire in 15 minutes. If you didn't create an account, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Lifecycle Marketplace. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Email - Lifecycle Marketplace
        
        Hi ${user.firstName || user.username},
        
        Thank you for registering with Lifecycle Marketplace! Please verify your email address using the verification code below:
        
        Verification Code: ${verificationCode}
        
        Enter this code on the verification page: ${verificationUrl}
        
        This code will expire in 15 minutes. If you didn't create an account, please ignore this email.
        
        © ${new Date().getFullYear()} Lifecycle Marketplace. All rights reserved.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email} with code: ${verificationCode}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Lifecycle Marketplace" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - Lifecycle Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Lifecycle Marketplace</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>Hi ${user.firstName || user.username},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Lifecycle Marketplace. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

