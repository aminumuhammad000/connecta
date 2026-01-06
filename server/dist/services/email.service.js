"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = exports.sendProposalAcceptedEmail = exports.sendEmail = exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create reusable transporter
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
/**
 * Send OTP email to user
 */
/**
 * Send OTP email to user
 */
const sendOTPEmail = async (email, otp, userName, type = 'PASSWORD_RESET') => {
    try {
        const isVerification = type === 'EMAIL_VERIFICATION';
        const subject = isVerification ? 'Verify Your Email - Connecta' : 'Password Reset OTP - Connecta';
        const title = isVerification ? 'Verify Your Email' : 'Password Reset Request';
        const message = isVerification
            ? 'Welcome to Connecta! Please use the verification code below to verify your email address:'
            : 'We received a request to reset your password. Use the OTP code below to proceed with resetting your password:';
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Connecta'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              color: #6366f1;
              margin-bottom: 10px;
            }
            .otp-box {
              background: #f8f9fa;
              border: 2px solid #6366f1;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #6366f1;
              margin: 10px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Connecta</div>
              <h2 style="margin: 0; color: #1f2937;">${title}</h2>
            </div>
            
            <p>Hi ${userName || 'there'},</p>
            
            <p>${message}</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email.
            </div>
            
            <p>For security reasons, this code will expire in 10 minutes.</p>
            
            <div class="footer">
              <p>This is an automated email, please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Connecta. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${userName || 'there'},

${title}

${message}

Your Code: ${otp}

This code is valid for 10 minutes.

If you didn't request this, please ignore this email.

- Connecta Team
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message || error };
    }
};
exports.sendOTPEmail = sendOTPEmail;
/**
 * Send generic email
 */
const sendEmail = async (to, subject, html, text) => {
    try {
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Connecta'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message || error };
    }
};
exports.sendEmail = sendEmail;
/**
 * Send Proposal Accepted Email
 */
const sendProposalAcceptedEmail = async (email, freelancerName, projectName, clientName, projectLink) => {
    const subject = `Congratulations! You've been hired for ${projectName}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .btn { background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>You've been hired! 🎉</h2>
            <p>Hi ${freelancerName},</p>
            <p>Great news! <strong>${clientName}</strong> has accepted your proposal for the project <strong>${projectName}</strong>.</p>
            <p>The project workspace is now active. You can communicate with the client and start working immediately.</p>
            
            <a href="${projectLink}" class="btn">Go to Project Workspace</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                ${projectLink}
            </p>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${freelancerName}, Great news! ${clientName} has accepted your proposal for ${projectName}. Go to your dashboard to start working.`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendProposalAcceptedEmail = sendProposalAcceptedEmail;
/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('Email server is ready to send messages');
        return true;
    }
    catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
