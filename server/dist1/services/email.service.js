"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGigNotificationEmail = exports.verifyEmailConfig = exports.sendBroadcastEmail = exports.sendNewProposalNotificationToClient = exports.sendWithdrawalRequestEmail = exports.sendPaymentReceiptEmail = exports.sendJobPostedEmail = exports.sendWelcomeEmail = exports.sendWorkSubmittedEmail = exports.sendPaymentReleasedEmail = exports.sendProposalRejectedEmail = exports.sendProposalAcceptedEmail = exports.sendEmail = exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const SystemSettings_model_1 = __importDefault(require("../models/SystemSettings.model"));
dotenv_1.default.config();
// Helper to get transporter with latest settings
const getTransporter = async () => {
    try {
        // Try to get settings from DB
        const settings = await SystemSettings_model_1.default.findOne();
        // Use DB settings if available and complete, otherwise fallback to env
        const provider = settings?.smtp?.provider || 'other';
        const user = settings?.smtp?.user || process.env.SMTP_USER;
        const pass = settings?.smtp?.pass || process.env.SMTP_PASS;
        if (!user || !pass) {
            console.warn('SMTP credentials missing');
            return null;
        }
        if (provider === 'gmail') {
            return nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: { user, pass },
            });
        }
        // Fallback to 'other' provider logic
        const host = settings?.smtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = settings?.smtp?.port || parseInt(process.env.SMTP_PORT || '587');
        const secure = settings?.smtp?.secure ?? false;
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });
    }
    catch (error) {
        console.error('Error creating transporter:', error);
        return null;
    }
};
/**
 * Send OTP email to user
 */
const sendOTPEmail = async (email, otp, userName, type = 'PASSWORD_RESET') => {
    try {
        const transporter = await getTransporter();
        if (!transporter)
            return { success: false, error: 'Transporter not available' };
        const settings = await SystemSettings_model_1.default.findOne();
        const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta';
        const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
        const isVerification = type === 'EMAIL_VERIFICATION';
        const subject = isVerification ? 'Verify Your Email - Connecta' : 'Password Reset OTP - Connecta';
        const title = isVerification ? 'Verify Your Email' : 'Password Reset Request';
        const message = isVerification
            ? 'Welcome to Connecta! Please use the verification code below to verify your email address:'
            : 'We received a request to reset your password. Use the OTP code below to proceed with resetting your password:';
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
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
        const transporter = await getTransporter();
        if (!transporter)
            return { success: false, error: 'Transporter not available' };
        const settings = await SystemSettings_model_1.default.findOne();
        const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta';
        const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
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
 * Send Proposal Rejected Email
 */
const sendProposalRejectedEmail = async (email, freelancerName, clientName, proposalTitle) => {
    const subject = `Update on your proposal for ${proposalTitle}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Proposal Update</h2>
            <p>Hi ${freelancerName},</p>
            <p>Thank you for submitting your proposal for <strong>${proposalTitle}</strong>.</p>
            <p>Unfortunately, <strong>${clientName}</strong> has decided not to move forward with your proposal at this time.</p>
            <p>Don't be discouraged! There are many other opportunities waiting for you on Connecta.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Best regards,<br>The Connecta Team
            </p>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${freelancerName}, Unfortunately, ${clientName} has decided not to move forward with your proposal for ${proposalTitle}. Keep applying to other jobs!`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendProposalRejectedEmail = sendProposalRejectedEmail;
/**
 * Send Payment Released Email
 */
const sendPaymentReleasedEmail = async (email, freelancerName, projectName, amount) => {
    const subject = `Payment Released for ${projectName}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .btn { background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Payment Released! 💰</h2>
            <p>Hi ${freelancerName},</p>
            <p>Great job! The client has approved your work for <strong>${projectName}</strong> and released the payment.</p>
            <p><strong>Amount: ${amount}</strong></p>
            <p>The funds effectively moved from Escrow to your Available Balance. You can withdraw them now.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/wallet" class="btn">Go to Wallet</a>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${freelancerName}, Payment of ${amount} for ${projectName} has been released to your wallet. You can withdraw it now.`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendPaymentReleasedEmail = sendPaymentReleasedEmail;
/**
 * Send Work Submitted Email
 */
const sendWorkSubmittedEmail = async (email, clientName, freelancerName, projectName) => {
    const subject = `Work Submitted for ${projectName}`;
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
            <h2>Work Submitted 📝</h2>
            <p>Hi ${clientName},</p>
            <p><strong>${freelancerName}</strong> has submitted their work for the project <strong>${projectName}</strong>.</p>
            <p>Please review the deliverables and approve the project to release the funds if everything looks good.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" class="btn">Review Project</a>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${clientName}, ${freelancerName} has submitted work for ${projectName}. Please review and approve.`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendWorkSubmittedEmail = sendWorkSubmittedEmail;
/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, name) => {
    const subject = `Welcome to Connecta! 🚀`;
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
            <h2>Welcome to Connecta, ${name}!</h2>
            <p>We are thrilled to have you on board. Your account has been successfully verified.</p>
            <p>Start exploring jobs or posting projects today.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/home" class="btn">Get Started</a>
          </div>
        </body>
        </html>
    `;
    return (0, exports.sendEmail)(email, subject, html, `Welcome to Connecta, ${name}! Your account is verified.`);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
/**
 * Send Job Posted Email
 */
const sendJobPostedEmail = async (email, name, jobTitle, jobLink) => {
    const subject = `Job Posted: ${jobTitle}`;
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
            <h2>Your Job is Live! 📢</h2>
            <p>Hi ${name},</p>
            <p>Your job <strong>${jobTitle}</strong> has been successfully posted and is now visible to freelancers.</p>
            <p>You will be notified when proposals start coming in.</p>
            <a href="${jobLink}" class="btn">View Job</a>
          </div>
        </body>
        </html>
    `;
    return (0, exports.sendEmail)(email, subject, html, `Your job ${jobTitle} is live.`);
};
exports.sendJobPostedEmail = sendJobPostedEmail;
/**
 * Send Payment Receipt Email
 */
const sendPaymentReceiptEmail = async (email, name, amount, projectTitle) => {
    const subject = `Payment Receipt`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
             body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Payment Received ✅</h2>
            <p>Hi ${name},</p>
            <p>We have received your payment of <strong>${amount}</strong> for the project <strong>${projectTitle}</strong>.</p>
            <p>The funds are now held in escrow and will be released to the freelancer upon completion.</p>
            <p>Thank you for using Connecta.</p>
          </div>
        </body>
        </html>
    `;
    return (0, exports.sendEmail)(email, subject, html, `Payment of ${amount} for ${projectTitle} received.`);
};
exports.sendPaymentReceiptEmail = sendPaymentReceiptEmail;
/**
 * Send Withdrawal Request Email
 */
const sendWithdrawalRequestEmail = async (email, name, amount) => {
    const subject = `Withdrawal Request Received`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
             body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Withdrawal Request Received 🏦</h2>
            <p>Hi ${name},</p>
            <p>We received your request to withdraw <strong>${amount}</strong>.</p>
            <p>Your request is being processed and funds will be sent to your bank account shortly (usually within 24 hours).</p>
          </div>
        </body>
        </html>
    `;
    return (0, exports.sendEmail)(email, subject, html, `Withdrawal request for ${amount} received.`);
};
exports.sendWithdrawalRequestEmail = sendWithdrawalRequestEmail;
/**
 * Send New Proposal Notification to Client
 */
const sendNewProposalNotificationToClient = async (email, clientName, freelancerName, jobTitle, proposalLink) => {
    const subject = `New Proposal for ${jobTitle}`;
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
            <h2>New Proposal Received! 📄</h2>
            <p>Hi ${clientName},</p>
            <p><strong>${freelancerName}</strong> has just submitted a proposal for your project <strong>${jobTitle}</strong>.</p>
            <p>Review their proposal to see if they are a good fit for your project.</p>
            
            <a href="${proposalLink}" class="btn">View Proposal</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you can't click the button, view your job entries on the Connecta app.
            </p>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${clientName}, ${freelancerName} has submitted a proposal for ${jobTitle}. Check your dashboard to review it.`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendNewProposalNotificationToClient = sendNewProposalNotificationToClient;
/**
 * Send Broadcast Email to Multiple Recipients
 */
const sendBroadcastEmail = async (recipients, subject, body) => {
    try {
        const transporter = await getTransporter();
        if (!transporter) {
            return { success: false, sent: 0, failed: recipients.length, errors: ['Transporter not available'] };
        }
        const settings = await SystemSettings_model_1.default.findOne();
        const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta';
        const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
        let sent = 0;
        let failed = 0;
        const errors = [];
        // Send emails to all recipients
        for (const recipient of recipients) {
            try {
                const html = `
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
                border-bottom: 2px solid #6366f1;
                padding-bottom: 20px;
              }
              .logo {
                font-size: 32px;
                font-weight: 800;
                color: #6366f1;
                margin-bottom: 10px;
              }
              .content {
                margin: 30px 0;
                white-space: pre-wrap;
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
              </div>
              
              <div class="content">
                ${body.replace(/\n/g, '<br>')}
              </div>
              
              <div class="footer">
                <p>This is an automated email from Connecta.</p>
                <p>&copy; ${new Date().getFullYear()} Connecta. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;
                const mailOptions = {
                    from: `"${fromName}" <${fromEmail}>`,
                    to: recipient,
                    subject,
                    html,
                    text: body,
                };
                await transporter.sendMail(mailOptions);
                sent++;
                console.log(`Broadcast email sent to: ${recipient}`);
            }
            catch (error) {
                failed++;
                errors.push({ recipient, error: error.message || error });
                console.error(`Failed to send email to ${recipient}:`, error);
            }
        }
        return {
            success: sent > 0,
            sent,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    catch (error) {
        console.error('Error sending broadcast email:', error);
        return {
            success: false,
            sent: 0,
            failed: recipients.length,
            errors: [error.message || error],
        };
    }
};
exports.sendBroadcastEmail = sendBroadcastEmail;
/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
    try {
        const transporter = await getTransporter();
        if (!transporter)
            return false;
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
/**
 * Send Gig Notification Email
 */
const sendGigNotificationEmail = async (email, userName, jobTitle, jobLink, skills) => {
    const subject = `New Gig Alert: ${jobTitle}`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .btn { background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            .skills { margin-top: 10px; }
            .skill-tag { background-color: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Gig Alert! 🚀</h2>
            <p>Hi ${userName},</p>
            <p>A new gig matching your skills has just been posted:</p>
            <h3>${jobTitle}</h3>
            
            <div class="skills">
              ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>

            <p>Check it out and apply now if you're interested!</p>
            
            <a href="${jobLink}" class="btn">View Gig</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                ${jobLink}
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              You received this email because you are subscribed to gig notifications. 
              To unsubscribe, update your notification settings in your profile.
            </p>
          </div>
        </body>
        </html>
    `;
    const text = `Hi ${userName}, A new gig matching your skills has been posted: ${jobTitle}. Skills: ${skills.join(', ')}. View it here: ${jobLink}`;
    return (0, exports.sendEmail)(email, subject, html, text);
};
exports.sendGigNotificationEmail = sendGigNotificationEmail;
