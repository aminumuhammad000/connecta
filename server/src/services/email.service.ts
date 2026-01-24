import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model';
import { getBaseTemplate } from '../utils/emailTemplates';

dotenv.config();

// Helper to get transporter with latest settings
const getTransporter = async () => {
  try {
    // Try to get settings from DB
    const settings = await SystemSettings.findOne();

    // Use DB settings if available and complete, otherwise fallback to env
    const provider = settings?.smtp?.provider || 'other';
    const user = settings?.smtp?.user || process.env.SMTP_USER;
    const pass = settings?.smtp?.pass || process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn('SMTP credentials missing');
      return null;
    }

    if (provider === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    // Fallback to 'other' provider logic
    const host = settings?.smtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = settings?.smtp?.port || parseInt(process.env.SMTP_PORT || '587');
    const secure = settings?.smtp?.secure ?? false;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
};

/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName?: string,
  type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' = 'PASSWORD_RESET'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { success: false, error: 'Transporter not available' };

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;

    // For automated emails, we prefer a no-reply address if possible, 
    // but we must send FROM the authenticated user to avoid spam filters/errors.
    // We set the Reply-To to a no-reply address.
    const replyTo = 'no-reply@myconnecta.ng';

    const isVerification = type === 'EMAIL_VERIFICATION';
    const subject = isVerification ? 'Verify Your Email - Connecta' : 'Password Reset OTP - Connecta';
    const title = isVerification ? 'Verify Your Email' : 'Password Reset Request';
    const message = isVerification
      ? 'Welcome to Connecta! Please use the verification code below to verify your email address:'
      : 'We received a request to reset your password. Use the OTP code below to proceed with resetting your password:';

    const html = getBaseTemplate({
      title: title,
      subject: subject,
      content: `
        <p>Hi ${userName || 'there'},</p>
        <p>${message}</p>
        <div style="background: #f8f9fa; border: 2px solid #FD6730; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #FD6730; margin: 10px 0;">${otp}</div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email.
        </div>
      `
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: replyTo,
      to: email,
      subject: subject,
      html: html,
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
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Send generic email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { success: false, error: 'Transporter not available' };

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;

    // Wrap HTML in base template if it's not already a full document
    const finalHtml = html.includes('<!DOCTYPE html>')
      ? html
      : getBaseTemplate({
        title: subject,
        subject: subject,
        content: html
      });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: finalHtml,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Send Welcome Email to New User
 */
export const sendWelcomeEmail = async (
  email: string,
  userName: string
): Promise<{ success: boolean; error?: any }> => {
  const subject = 'Welcome to Connecta! 🎉';
  const html = getBaseTemplate({
    title: 'Welcome to Connecta! 🚀',
    subject: subject,
    content: `
      <p>Hi ${userName},</p>
      <p>We're thrilled to have you on board! Your account has been successfully verified.</p>
      <p>Connecta is your gateway to finding amazing projects and talented professionals.</p>
      
      <h3>Here's what you can do next:</h3>
      <ul>
        <li><strong>Complete your profile:</strong> Add your skills, portfolio, and experience to stand out.</li>
        <li><strong>Browse jobs:</strong> Find projects that match your expertise.</li>
        <li><strong>Post a project:</strong> Hire top talent for your needs.</li>
      </ul>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If you have any questions, feel free to reply to this email.
      </p>
    `,
    actionUrl: process.env.CLIENT_URL || 'https://app.myconnecta.ng',
    actionText: 'Get Started'
  });
  const text = `Hi ${userName}, Welcome to Connecta! Your account has been successfully verified. We're thrilled to have you on board.`;

  return sendEmail(email, subject, html, text);
};

/**
 * Send Proposal Accepted Email
 */
export const sendProposalAcceptedEmail = async (
  email: string,
  freelancerName: string,
  projectName: string,
  clientName: string,
  projectLink: string
): Promise<{ success: boolean; error?: any }> => {
  const subject = `Congratulations! You've been hired for ${projectName}`;
  const html = getBaseTemplate({
    title: "You've been hired! 🎉",
    subject: subject,
    content: `
      <p>Hi ${freelancerName},</p>
      <p>Great news! <strong>${clientName}</strong> has accepted your proposal for the project <strong>${projectName}</strong>.</p>
      <p>The project workspace is now active. You can communicate with the client and start working immediately.</p>
    `,
    actionUrl: projectLink,
    actionText: 'Go to Project Workspace'
  });
  const text = `Hi ${freelancerName}, Great news! ${clientName} has accepted your proposal for ${projectName}. Go to your dashboard to start working.`;

  return sendEmail(email, subject, html, text);
};

/**
 * Send Proposal Rejected Email
 */
export const sendProposalRejectedEmail = async (
  email: string,
  freelancerName: string,
  clientName: string,
  proposalTitle: string
): Promise<{ success: boolean; error?: any }> => {
  const subject = `Update on your proposal for ${proposalTitle}`;
  const html = getBaseTemplate({
    title: 'Proposal Update',
    subject: subject,
    content: `
      <p>Hi ${freelancerName},</p>
      <p>Thank you for submitting your proposal for <strong>${proposalTitle}</strong>.</p>
      <p>Unfortunately, <strong>${clientName}</strong> has decided not to move forward with your proposal at this time.</p>
      <p>Don't be discouraged! There are many other opportunities waiting for you on Connecta.</p>
    `
  });
  const text = `Hi ${freelancerName}, Unfortunately, ${clientName} has decided not to move forward with your proposal for ${proposalTitle}. Keep applying to other jobs!`;

  return sendEmail(email, subject, html, text);
};

/**
 * Send New Proposal Notification to Client
 */
export const sendNewProposalNotificationToClient = async (
  email: string,
  clientName: string,
  freelancerName: string,
  jobTitle: string,
  proposalLink: string
): Promise<{ success: boolean; error?: any }> => {
  const subject = `New Proposal for ${jobTitle}`;
  const html = getBaseTemplate({
    title: 'New Proposal Received! 📄',
    subject: subject,
    content: `
      <p>Hi ${clientName},</p>
      <p><strong>${freelancerName}</strong> has just submitted a proposal for your project <strong>${jobTitle}</strong>.</p>
      <p>Review their proposal to see if they are a good fit for your project.</p>
    `,
    actionUrl: proposalLink,
    actionText: 'View Proposal'
  });
  const text = `Hi ${clientName}, ${freelancerName} has submitted a proposal for ${jobTitle}. Check your dashboard to review it.`;

  return sendEmail(email, subject, html, text);
};

/**
 * Send Broadcast Email to Multiple Recipients
 */
export const sendBroadcastEmail = async (
  recipients: string[],
  subject: string,
  body: string
): Promise<{ success: boolean; sent: number; failed: number; errors?: any[] }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      return { success: false, sent: 0, failed: recipients.length, errors: ['Transporter not available'] };
    }

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;

    let sent = 0;
    let failed = 0;
    const errors: any[] = [];

    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        const html = getBaseTemplate({
          title: subject,
          subject: subject,
          content: body.replace(/\n/g, '<br>')
        });

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
      } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error sending broadcast email:', error);
    return {
      success: false,
      sent: 0,
      failed: recipients.length,
      errors: [error.message || error],
    };
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return false;

    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

/**
 * Send Gig Notification Email
 */
export const sendGigNotificationEmail = async (
  email: string,
  userName: string,
  jobTitle: string,
  jobLink: string,
  skills: string[]
): Promise<{ success: boolean; error?: any }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { success: false, error: 'Transporter not available' };

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;

    // Set Reply-To to no-reply for notifications
    const replyTo = 'no-reply@myconnecta.ng';

    const subject = `New Gig Alert: ${jobTitle}`;
    const html = getBaseTemplate({
      title: 'New Gig Alert! 🚀',
      subject: subject,
      content: `
        <p>Hi ${userName},</p>
        <p>A new gig matching your skills has just been posted:</p>
        <h3 style="color: #111827; margin: 20px 0;">${jobTitle}</h3>
        
        <div style="margin: 20px 0;">
          ${skills.map(skill => `<span style="background-color: #FFF0EB; color: #FD6730; padding: 6px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; display: inline-block; font-weight: 600;">${skill}</span>`).join('')}
        </div>

        <p>Check it out and apply now if you're interested!</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">
          You received this email because you are subscribed to gig notifications. 
          To unsubscribe, update your notification settings in your profile.
        </p>
      `,
      actionUrl: jobLink,
      actionText: 'View Gig'
    });
    const text = `Hi ${userName}, A new gig matching your skills has been posted: ${jobTitle}. Skills: ${skills.join(', ')}. View it here: ${jobLink}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: replyTo,
      to: email,
      subject: subject,
      html: html,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Gig notification email sent:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending gig notification email:', error);
    return { success: false, error: error.message || error };
  }
};
