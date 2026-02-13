import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model.js';
import { getBaseTemplate } from '../utils/emailTemplates.js';

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
/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName?: string,
  type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' = 'PASSWORD_RESET',
  language: 'en' | 'ha' = 'en'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { success: false, error: 'Transporter not available' };

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
    const replyTo = 'no-reply@myconnecta.ng';

    const isVerification = type === 'EMAIL_VERIFICATION';

    // Translations
    let subject, title, message, codeLabel, validLabel, ignoreLabel, ignoreMsg, greeting, team;

    if (language === 'ha') {
      subject = isVerification ? 'Tabbatar da Imel dinka - Connecta' : 'Lambar Sake Saita Kalmar Sirri - Connecta';
      title = isVerification ? 'Tabbatar da Imel dinka' : 'Bukatar Sake Saita Kalmar Sirri';
      message = isVerification
        ? 'Barka da zuwa Connecta! Don Allah yi amfani da lambar tabbatarwa da ke kasa don tantance adireshin imel dinka:'
        : 'Mun sami bukatar sake saita kalmar sirrinka. Yi amfani da lambar OTP da ke kasa don ci gaba da sake saita kalmar sirrinka:';
      codeLabel = 'Lambar Tabbatarwa';
      validLabel = 'Yana aiki na mintuna 10';
      ignoreLabel = '⚠️ Sanarwar Tsaro:';
      ignoreMsg = 'Idan ba kai ka nemi wannan lambar ba, don Allah ka yi watsi da wannan imel din.';
      greeting = `Sannu ${userName || ''},`;
      team = '- Kungiyar Connecta';
    } else {
      subject = isVerification ? 'Verify Your Email - Connecta' : 'Password Reset OTP - Connecta';
      title = isVerification ? 'Verify Your Email' : 'Password Reset Request';
      message = isVerification
        ? 'Welcome to Connecta! Please use the verification code below to verify your email address:'
        : 'We received a request to reset your password. Use the OTP code below to proceed with resetting your password:';
      codeLabel = 'Your Verification Code';
      validLabel = 'Valid for 10 minutes';
      ignoreLabel = '⚠️ Security Notice:';
      ignoreMsg = "If you didn't request this code, please ignore this email.";
      greeting = `Hi ${userName || 'there'},`;
      team = '- Connecta Team';
    }

    const html = getBaseTemplate({
      title: title,
      subject: subject,
      content: `
        <p>${greeting}</p>
        <p>${message}</p>
        <div style="background: #f8f9fa; border: 2px solid #FD6730; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${codeLabel}</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #FD6730; margin: 10px 0;">${otp}</div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${validLabel}</p>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <strong>${ignoreLabel}</strong> ${ignoreMsg}
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
${greeting}

${title}

${message}

${codeLabel}: ${otp}

${validLabel}

${ignoreMsg}

${team}
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
  userName: string,
  language: 'en' | 'ha' = 'en'
): Promise<{ success: boolean; error?: any }> => {
  const subject = language === 'ha' ? 'Barka da zuwa Connecta! 🎉' : 'Welcome to Connecta! 🎉';
  
  let content, title, actionText, text;
  
  if (language === 'ha') {
      title = 'Barka da zuwa Connecta! 🚀';
      content = `
        <p>Sannu ${userName},</p>
        <p>Muna farin cikin kasancewarka tare da mu! Mun yi nasarar tabbatar da akantinka.</p>
        <p>Connecta ita ce kofar samun manyan ayyuka da kuma kwararrun ma'aikata.</p>
        
        <h3>Ga abubuwan da za ka iya yi yanzu:</h3>
        <ul>
          <li><strong>Cike bayanan ka:</strong> Saka kwarewarka, ayyukan da ka yi, da kumaogwanka don ficewa.</li>
          <li><strong>Nemi ayyuka:</strong> Nemi ayyukan da suka dace da kwarewarka.</li>
          <li><strong>Saka aiki:</strong> Dauki kwararru don su yi maka aikinka.</li>
        </ul>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Idan kana da wata tambaya, za ka iya amsa wannan imel din.
        </p>
      `;
      actionText = 'Fara Yanzu';
      text = `Sannu ${userName}, Barka da zuwa Connecta! Mun yi nasarar tabbatar da akantinka. Muna farin cikin kasancewarka tare da mu.`;
  } else {
      title = 'Welcome to Connecta! 🚀';
      content = `
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
      `;
      actionText = 'Get Started';
      text = `Hi ${userName}, Welcome to Connecta! Your account has been successfully verified. We're thrilled to have you on board.`;
  }

  const html = getBaseTemplate({
    title: title,
    subject: subject,
    content: content,
    actionUrl: process.env.CLIENT_URL || 'https://app.myconnecta.ng',
    actionText: actionText
  });

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
/**
 * Send Gig Notification Email
 */
export const sendGigNotificationEmail = async (
  email: string,
  userName: string,
  jobTitle: string,
  jobLink: string,
  skills: string[],
  language: 'en' | 'ha' = 'en'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const transporter = await getTransporter();
    if (!transporter) return { success: false, error: 'Transporter not available' };

    const settings = await SystemSettings.findOne();
    const fromName = settings?.smtp?.fromName || process.env.FROM_NAME || 'Connecta Inc.';
    const fromEmail = settings?.smtp?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
    const replyTo = 'no-reply@myconnecta.ng';

    let subject, title, intro, outro, unsubscribe, viewAction;

    if (language === 'ha') {
        subject = `Sabuwar Dama: ${jobTitle}`;
        title = 'Sabuwar Dama! 🚀';
        intro = `Sannu ${userName},<br>An samu sabon aiki da ya dace da kwarewarka:`;
        outro = 'Duba shi yanzu kuma ka nemi aikin idan kana sha\'awa!';
        unsubscribe = 'Ka samu wannan imel din ne saboda ka yi rajistar sanarwar ayyuka. Don daina karba, sabunta saitunanka a profile.';
        viewAction = 'Duba Aikin';
    } else {
        subject = `New Gig Alert: ${jobTitle}`;
        title = 'New Gig Alert! 🚀';
        intro = `Hi ${userName},<br>A new gig matching your skills has just been posted:`;
        outro = "Check it out and apply now if you're interested!";
        unsubscribe = 'You received this email because you are subscribed to gig notifications. To unsubscribe, update your notification settings in your profile.';
        viewAction = 'View Gig';
    }

    const html = getBaseTemplate({
      title: title,
      subject: subject,
      content: `
        <p>${intro}</p>
        <h3 style="color: #111827; margin: 20px 0;">${jobTitle}</h3>
        
        <div style="margin: 20px 0;">
          ${skills.map(skill => `<span style="background-color: #FFF0EB; color: #FD6730; padding: 6px 12px; border-radius: 20px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; display: inline-block; font-weight: 600;">${skill}</span>`).join('')}
        </div>

        <p>${outro}</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">
          ${unsubscribe}
        </p>
      `,
      actionUrl: jobLink,
      actionText: viewAction
    });
    
    // Simple text version fallback
    const text = language === 'ha'
        ? `Sannu ${userName}, Sabuwar dama ta fito: ${jobTitle}. Kwarewa: ${skills.join(', ')}. Duba anan: ${jobLink}`
        : `Hi ${userName}, A new gig matching your skills has been posted: ${jobTitle}. Skills: ${skills.join(', ')}. View it here: ${jobLink}`;

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

/**
 * Send Profile Completion Reminder Email
 */
export const sendProfileReminderEmail = async (
  email: string,
  userName: string
): Promise<{ success: boolean; error?: any }> => {
  const subject = 'Complete your profile on Connecta! 🚀';
  const html = getBaseTemplate({
    title: 'Stand out from the crowd! ✨',
    subject: subject,
    content: `
      <p>Hi ${userName},</p>
      <p>We noticed you haven't completed your profile yet. A complete profile is your best tool for success on Connecta!</p>
      
      <div style="background: #FFF0EB; border-left: 4px solid #FD6730; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #111827; font-weight: 600;">Did you know?</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #4B5563;">Users with complete profiles are <strong>5x more likely</strong> to get hired or found by clients.</p>
      </div>

      <h3>Quick things you can add now:</h3>
      <ul>
        <li><strong>Bio:</strong> Tell everyone what you do best.</li>
        <li><strong>Skills:</strong> Help our matching engine find the right gigs for you.</li>
        <li><strong>Portfolio:</strong> Show off your amazing past work.</li>
      </ul>
      
      <p style="margin-top: 30px;">Don't miss out on great opportunities. Complete your profile today!</p>
    `,
    actionUrl: `${process.env.CLIENT_URL || 'https://app.myconnecta.ng'}/settings/profile`,
    actionText: 'Complete My Profile'
  });
  const text = `Hi ${userName}, complete your profile on Connecta to stand out! Users with complete profiles are 5x more likely to get hired.`;

  return sendEmail(email, subject, html, text);
};
