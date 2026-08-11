
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
    const heroBanner = bannerUrl || 'https://myconnecta.ng/email_banner.jpg';

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
            font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
            color: #1E293B;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .email-outer-wrapper {
            width: 100%;
            background-color: #F8FAFC;
            padding: 40px 16px;
            box-sizing: border-box;
        }
        .top-logo-bar {
            text-align: center;
            padding-bottom: 24px;
        }
        .top-logo-img {
            height: 38px;
            width: auto;
            vertical-align: middle;
        }
        .top-logo-text {
            font-size: 26px;
            font-weight: 800;
            color: #0F172A;
            vertical-align: middle;
            margin-left: 8px;
            text-decoration: none;
            display: inline-block;
        }
        .email-card {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
            border: 1px solid #E2E8F0;
        }
        .hero-banner-wrap {
            width: 100%;
            overflow: hidden;
            background: #FD6730;
        }
        .hero-banner-img {
            width: 100%;
            height: auto;
            display: block;
            border: none;
        }
        .card-body {
            padding: 40px 36px;
            background: #ffffff;
        }
        .email-heading {
            color: #0F172A;
            font-size: 24px;
            margin: 0 0 20px;
            font-weight: 800;
            letter-spacing: -0.3px;
        }
        .body-text {
            color: #475569;
            font-size: 15px;
            line-height: 1.65;
        }
        .otp-display-box {
            background: linear-gradient(135deg, #FFF7F5 0%, #FFF0EC 100%);
            border: 2px dashed #FD6730;
            border-radius: 14px;
            padding: 24px 20px;
            text-align: center;
            margin: 28px 0;
        }
        .otp-number {
            font-size: 40px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #FD6730;
            font-family: 'Courier New', Courier, monospace;
            margin: 6px 0;
            text-indent: 12px;
        }
        .cta-wrap {
            margin: 32px 0 12px;
            text-align: left;
        }
        .btn-cta {
            background: linear-gradient(135deg, #FD6730 0%, #E5521B 100%);
            color: #ffffff !important;
            padding: 14px 36px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(253, 103, 48, 0.35);
        }
        .notice-callout {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 14px 16px;
            margin: 24px 0 0;
            border-radius: 8px;
            color: #78350F;
            font-size: 13px;
            line-height: 1.5;
        }
        .card-footer {
            padding: 28px 24px;
            text-align: center;
            color: #94A3B8;
            font-size: 13px;
            line-height: 1.6;
        }
        .card-footer a {
            color: #FD6730;
            text-decoration: none;
            font-weight: 600;
        }
        @media only screen and (max-width: 480px) {
            .email-outer-wrapper {
                padding: 16px 8px;
            }
            .card-body {
                padding: 28px 20px;
            }
            .otp-number {
                font-size: 32px;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-outer-wrapper">
        {/* Top Centered Logo */}
        <div class="top-logo-bar">
            <a href="https://myconnecta.ng" style="text-decoration: none;">
                <img src="https://myconnecta.ng/icon.png" alt="Connecta Logo" class="top-logo-img" />
                <span class="top-logo-text">Connecta</span>
            </a>
        </div>

        {/* Main Card */}
        <div class="email-card">
            {/* Hero Illustration Banner */}
            <div class="hero-banner-wrap">
                <img src="${heroBanner}" alt="Connecta Welcome Banner" class="hero-banner-img" />
            </div>

            {/* Card Content Area */}
            <div class="card-body">
                <h1 class="email-heading">${title}</h1>
                <div class="body-text">
                    ${content}
                </div>
                
                ${actionUrl ? `
                <div class="cta-wrap">
                    <a href="${actionUrl}" class="btn-cta">${actionText || 'Get Started'}</a>
                </div>
                ` : ''}
            </div>
        </div>

        {/* Outer Clean Footer */}
        <div class="card-footer">
            <p>Sent by Connecta Inc. • <a href="https://myconnecta.ng">Check our blog</a> • <a href="https://myconnecta.ng">@connecta_inc</a></p>
            <p>Suite 3-4, Gidan Saude, Beside First Bank, Zoo Road, Kano, Nigeria</p>
        </div>
    </div>
</body>
</html>
  `;
};
