
export const generateEmailHtml = (
  title: string,
  body: string,
  callToAction: string,
  ctaUrl: string = 'https://maternalert.app',
  accentColor: string = '#2DE474' // Default to primary neon green
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F9FAFB;
      font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1A212E;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      overflow: hidden;
      border-radius: 16px;
      margin-top: 40px;
      margin-bottom: 40px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #FFFFFF;
      padding: 32px 40px;
      text-align: center;
      border-bottom: 1px solid #F3F4F6;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #2DE474;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1A212E;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .body {
      font-size: 16px;
      color: #4B5563;
      margin-bottom: 32px;
    }
    .cta-container {
      text-align: center;
      margin-top: 40px;
    }
    .cta-button {
      background-color: ${accentColor};
      color: #FFFFFF;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .footer {
      background-color: #F9FAFB;
      padding: 32px 40px;
      text-align: center;
      font-size: 14px;
      color: #9CA3AF;
    }
    .disclaimer {
      font-size: 12px;
      margin-top: 24px;
      border-top: 1px solid #E5E7EB;
      padding-top: 24px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin-top: 0;
        margin-bottom: 0;
        border-radius: 0;
      }
      .content {
        padding: 32px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://maternalert.app" class="logo">MaternAlert</a>
    </div>
    <div class="content">
      <h1 class="title">${title}</h1>
      <p class="body">${body.replace(/\n/g, '<br>')}</p>
      
      <div class="cta-container">
        <a href="${ctaUrl}" class="cta-button">${callToAction}</a>
      </div>
    </div>
    <div class="footer">
      <p>Stay on top of your pregnancy health.</p>
      <p>&copy; 2026 MaternAlert. All rights reserved.</p>
      
      <div class="disclaimer">
        <p><strong>Disclaimer:</strong> MaternAlert is a support tool and NOT a diagnostic system. Always follow the advice of your healthcare provider. If you have an emergency, seek immediate medical care.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
