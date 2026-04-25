export const getBaseTemplate = (options) => {
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F7F8FC;
            color: #333333;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .header {
            background-color: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: #FD6730;
            text-decoration: none;
            display: inline-block;
        }
        .hero {
            padding: 40px 30px;
            text-align: center;
            background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
        }
        .hero h1 {
            color: #111827;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 700;
        }
        .content-area {
            text-align: left;
            color: #4B5563;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .btn-container {
            margin: 30px 0;
            text-align: center;
        }
        .btn {
            background-color: #FD6730;
            color: #ffffff !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
        }
        .app-promo {
            background-color: #F9FAFB;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #f0f0f0;
        }
        .app-promo-title {
            color: #111827;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 14px;
        }
        .app-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
        }
        .app-btn img {
            height: 32px;
            width: auto;
        }
        .footer {
            background-color: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #f0f0f0;
        }
        .footer p {
            font-size: 12px;
            color: #9CA3AF;
            margin: 8px 0;
        }
        .footer-links {
            margin-bottom: 16px;
        }
        .footer-link {
            color: #6B7280;
            text-decoration: none;
            font-size: 12px;
            margin: 0 8px;
        }
        @media only screen and (max-width: 480px) {
            .email-container {
                width: 100% !important;
                border-radius: 0;
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <a href="https://myconnecta.ng" class="logo-text">Connecta</a>
        </div>

        <div class="hero">
            <h1>${title}</h1>
            <div class="content-area">
                ${content}
            </div>
            
            ${actionUrl ? `
            <div class="btn-container">
                <a href="${actionUrl}" class="btn">${actionText || 'Click Here'}</a>
            </div>
            ` : ''}
        </div>

        <div class="app-promo">
            <p class="app-promo-title">Experience Connecta on Mobile</p>
            <div class="app-buttons">
                <a href="#" class="app-btn">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store">
                </a>
                <a href="#" class="app-btn">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store">
                </a>
            </div>
        </div>

        <div class="footer">
            <div class="footer-links">
                <a href="https://myconnecta.ng" class="footer-link">Website</a>
                <a href="https://myconnecta.ng/privacy" class="footer-link">Privacy Policy</a>
                <a href="https://myconnecta.ng/support" class="footer-link">Support</a>
            </div>
            <p>&copy; ${year} Connecta Inc. All rights reserved.</p>
            <p>You received this email because you are a member of Connecta.</p>
        </div>
    </div>
</body>
</html>
  `;
};
