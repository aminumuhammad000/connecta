
export interface EmailTemplateOptions {
    title: string;
    content: string;
    actionUrl?: string;
    actionText?: string;
    subject?: string;
}

export const getBaseTemplate = (options: EmailTemplateOptions) => {
    const { title, content, actionUrl, actionText, subject } = options;
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject || title}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Outfit', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F1F4F9;
            color: #1E293B;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #F1F4F9;
            padding: 40px 16px;
            box-sizing: border-box;
        }
        .email-card {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
            border: 1px solid #E2E8F0;
        }
        .header {
            background-color: #0F172A;
            background-image: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .logo-img {
            height: 36px;
            width: auto;
            vertical-align: middle;
        }
        .body-card {
            padding: 40px 32px;
            background: #ffffff;
        }
        .hero-title {
            color: #0F172A;
            font-size: 22px;
            margin: 0 0 20px;
            font-weight: 800;
            letter-spacing: -0.3px;
        }
        .content-text {
            color: #475569;
            font-size: 15px;
            line-height: 1.6;
        }
        .otp-box {
            background: linear-gradient(135deg, #FFF7F5 0%, #FFF0EC 100%);
            border: 2px dashed #FD6730;
            border-radius: 14px;
            padding: 26px 20px;
            text-align: center;
            margin: 28px 0;
        }
        .otp-code {
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #FD6730;
            font-family: 'Courier New', Courier, monospace;
            margin: 8px 0;
            text-indent: 12px;
        }
        .btn-container {
            margin: 32px 0;
            text-align: center;
        }
        .btn-primary {
            background: linear-gradient(135deg, #FD6730 0%, #E5521B 100%);
            color: #ffffff !important;
            padding: 14px 34px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(253, 103, 48, 0.35);
        }
        .notice-banner {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 14px 16px;
            margin: 24px 0 0;
            border-radius: 8px;
            color: #78350F;
            font-size: 13px;
            line-height: 1.5;
        }
        .app-section {
            background-color: #F8FAFC;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #F1F5F9;
        }
        .app-title {
            color: #64748B;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .app-store-badge {
            display: inline-block;
            margin: 0 6px;
        }
        .app-store-badge img {
            height: 34px;
            width: auto;
        }
        .footer {
            background-color: #0F172A;
            padding: 28px 24px;
            text-align: center;
            color: #94A3B8;
            font-size: 12px;
        }
        .footer a {
            color: #CBD5E1;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer p {
            margin: 6px 0;
        }
        @media only screen and (max-width: 480px) {
            .wrapper {
                padding: 12px 8px;
            }
            .body-card {
                padding: 28px 20px;
            }
            .otp-code {
                font-size: 32px;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="email-card">
            {/* Dark Brand Header */}
            <div class="header">
                <a href="https://myconnecta.ng">
                    <img src="https://myconnecta.ng/icon.png" alt="Connecta Logo" class="logo-img" style="height: 38px; vertical-align: middle;" />
                    <span style="color: #ffffff; font-size: 24px; font-weight: 800; vertical-align: middle; margin-left: 8px; font-family: sans-serif;">Connecta</span>
                </a>
            </div>

            {/* Main Content Area */}
            <div class="body-card">
                <h1 class="hero-title">${title}</h1>
                <div class="content-text">
                    ${content}
                </div>
                
                ${actionUrl ? `
                <div class="btn-container">
                    <a href="${actionUrl}" class="btn-primary">${actionText || 'Click Here'}</a>
                </div>
                ` : ''}
            </div>

            {/* Mobile App Section */}
            <div class="app-section">
                <div class="app-title">Get Connecta for iOS & Android</div>
                <div>
                    <a href="https://myconnecta.ng/download" class="app-store-badge">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store">
                    </a>
                    <a href="https://myconnecta.ng/download" class="app-store-badge">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store">
                    </a>
                </div>
            </div>

            {/* Dark Brand Footer */}
            <div class="footer">
                <div style="margin-bottom: 12px;">
                    <a href="https://myconnecta.ng">Website</a> • 
                    <a href="https://myconnecta.ng/privacy.html">Privacy</a> • 
                    <a href="https://myconnecta.ng/terms.html">Terms</a> • 
                    <a href="mailto:hello@myconnecta.ng">Support</a>
                </div>
                <p>&copy; ${year} Connecta Inc. Connecta HQ, Suite 3-4, Gidan Saude, Kano, Nigeria.</p>
                <p>Connecting verified African talent & global hiring teams.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
