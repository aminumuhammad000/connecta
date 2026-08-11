
export interface EmailTemplateOptions {
    title: string;
    content: string;
    actionUrl?: string;
    actionText?: string;
    subject?: string;
    bannerUrl?: string;
}

export const getBaseTemplate = (options: EmailTemplateOptions) => {
    const { title, content, actionUrl, actionText, subject, bannerUrl } = options;
    const year = new Date().getFullYear();
    const heroBanner = bannerUrl || 'https://myconnecta.ng/banner_email.jpg';

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject || title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 16px;">
        <tr>
            <td align="center">
                <!-- Top Centered Logo -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin-bottom: 24px;">
                    <tr>
                        <td align="center">
                            <a href="https://myconnecta.ng" style="text-decoration: none; display: inline-block;">
                                <img src="https://myconnecta.ng/logo_email.png" alt="Connecta Logo" width="38" height="38" style="vertical-align: middle; border: 0; outline: none; text-decoration: none;" />
                                <span style="font-size: 26px; font-weight: 800; color: #0F172A; vertical-align: middle; margin-left: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Connecta</span>
                            </a>
                        </td>
                    </tr>
                </table>

                <!-- Main Email Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);">
                    <!-- Hero Banner -->
                    <tr>
                        <td align="center" style="background-color: #FD6730; line-height: 0;">
                            <a href="https://myconnecta.ng" style="text-decoration: none;">
                                <img src="${heroBanner}" alt="Connecta Banner" width="580" style="width: 100%; max-width: 580px; height: auto; display: block; border: 0;" />
                            </a>
                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="padding: 40px 36px; background-color: #ffffff;">
                            <h1 style="color: #0F172A; font-size: 24px; margin: 0 0 20px 0; font-weight: 800; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${title}</h1>
                            <div style="color: #475569; font-size: 15px; line-height: 1.65; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                ${content}
                            </div>
                            
                            ${actionUrl ? `
                            <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="left" style="border-radius: 12px; background-color: #FD6730;">
                                        <a href="${actionUrl}" target="_blank" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 14px 36px; border: 1px solid #FD6730; display: inline-block; font-weight: 700;">${actionText || 'Get Started'}</a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin-top: 28px;">
                    <tr>
                        <td align="center" style="color: #94A3B8; font-size: 13px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            <p style="margin: 0 0 8px 0;">© 2026 Connecta. Developed by Pioneers ICT. All rights reserved.</p>
                            <p style="margin: 0;">Suite 3-4, Gidan Saude, Beside First Bank, Zoo Road, Kano, Nigeria</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
