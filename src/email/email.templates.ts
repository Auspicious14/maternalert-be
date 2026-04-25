
export const EMAIL_TEMPLATES = {
  FOOTER: `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 12px; text-align: center;">
      <p>MaternAlert — Protecting mothers and babies.</p>
      <p>This is an automated health alert.</p>
    </div>
  `,
  BASE: (content: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #1A1512; }
          .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #1A1512; padding: 24px; text-align: center; }
          .logo { color: #2DE474; font-size: 24px; font-weight: bold; text-decoration: none; }
          .content { padding: 32px; line-height: 1.6; }
          .footer { padding: 24px; background-color: #F9FAFB; }
          .button { display: inline-block; background-color: #2DE474; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .alert-box { padding: 16px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .alert-urgent { background-color: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; }
          .alert-critical { background-color: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">MaternAlert</span>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center;">
              MaternAlert — Protecting mothers and babies.<br>
              This is an automated health alert.
            </p>
          </div>
        </div>
      </body>
    </html>
  `,
  BP_ALERT: (systolic: number, diastolic: number, tier: string, instruction: string) => `
    <h2 style="color: #1A1512;">⚠️ Blood Pressure Alert</h2>
    <p>We've noticed a high blood pressure reading in your recent log:</p>
    <div class="alert-box ${tier === 'Critical' ? 'alert-critical' : 'alert-urgent'}">
      Reading: ${systolic}/${diastolic} mmHg<br>
      Status: ${tier}
    </div>
    <p><strong>Action Required:</strong> ${instruction}</p>
    <p>Please use the emergency screen in the MaternAlert app for immediate guidance and to find the nearest clinic.</p>
    <a href="maternalert://emergency" class="button">Open Emergency Screen</a>
  `,
  WEEKLY_SUMMARY: (stats: any) => `
    <h2 style="color: #1A1512;">Your Weekly BP Summary</h2>
    <p>Here's how your blood pressure looked from ${stats.weekStartDate} to ${stats.weekEndDate}:</p>
    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Average BP:</strong> ${stats.averageSystolic}/${stats.averageDiastolic} mmHg</p>
      <p style="margin: 5px 0;"><strong>Total Readings:</strong> ${stats.totalReadings}</p>
      <p style="margin: 5px 0;"><strong>High Readings:</strong> ${stats.highReadingsCount}</p>
    </div>
    ${stats.highReadingsCount > 0 
      ? '<p style="color: #991B1B; font-weight: bold;">⚠️ You had some high readings this week. Please continue to monitor closely and follow the care guidelines in the app.</p>'
      : '<p style="color: #065F46; font-weight: bold;">✨ Your readings look good! Keep up the great work logging daily.</p>'}
    <p>Consistency is key for early detection. See you in the app!</p>
    <a href="maternalert://tracking" class="button">Log Today's Reading</a>
  `,
  INACTIVITY: (days: number) => {
    let message = '';
    let cta = 'Log Today\'s Reading';
    if (days === 3) {
      message = "It's been 3 days since your last blood pressure entry. A quick check today helps us keep you and your baby safe!";
    } else if (days === 5) {
      message = "We haven't seen a reading in 5 days. Remember, pre-eclampsia can develop silently without obvious symptoms. Please take a moment to log your BP now.";
    } else {
      message = `It has been ${days} days since your last log. This is a serious reminder to check your blood pressure or contact your clinic if you are unable to do so. Your health is our priority.`;
      cta = 'Check My Health Now';
    }
    return `
      <h2 style="color: #1A1512;">We haven't seen you in a while</h2>
      <p>${message}</p>
      <a href="maternalert://tracking" class="button">${cta}</a>
    `;
  },
  TREND_ALERT: (trendType: string, message: string) => {
    const descriptions: Record<string, string> = {
      CREEPING_RISE: "We've detected a slow but steady increase in your blood pressure readings over the last few days.",
      REPEATED_HIGH: "Your last several readings have consistently been in the elevated range.",
      SUDDEN_SPIKE: "Your latest reading shows a significant and sudden jump from your previous baseline."
    };
    return `
      <h2 style="color: #1A1512;">Blood Pressure Pattern Detected</h2>
      <p>${descriptions[trendType] || 'Our monitoring engine has identified a concerning pattern in your blood pressure readings.'}</p>
      <div style="background-color: #FFFBEB; border-left: 4px solid #FCD34D; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #92400E;"><strong>Analysis:</strong> ${message}</p>
      </div>
      <p><strong>Please contact your clinic or healthcare provider to discuss these trends.</strong></p>
      <a href="maternalert://clinic" class="button">Find My Clinic</a>
    `;
  },
  WELCOME: (userName: string) => `
    <h2 style="color: #1A1512;">Welcome to MaternAlert, ${userName || 'Mama'}! 🌿</h2>
    <p>We're here to help you navigate your pregnancy safely by focusing on early detection of pre-eclampsia.</p>
    <p>With MaternAlert, you can:</p>
    <ul>
      <li>Log and track your blood pressure daily</li>
      <li>Receive instant alerts if your readings are concerning</li>
      <li>Detect dangerous trends before they become emergencies</li>
      <li>Store your clinic and emergency contact information</li>
    </ul>
    <p>Take a moment to complete your profile and add an emergency contact for extra peace of mind.</p>
    <a href="maternalert://profile" class="button">Complete My Profile</a>
  `,
  EMERGENCY_CONTACT: (userName: string, systolic: number, diastolic: number) => `
    <h2 style="color: #991B1B;">[URGENT] ${userName} may need help</h2>
    <p>This is an automated alert from MaternAlert.</p>
    <p><strong>${userName}</strong> just logged a dangerous blood pressure reading: <strong>${systolic}/${diastolic} mmHg</strong>.</p>
    <p>This level of blood pressure can be serious during pregnancy. Please check on them immediately and ensure they are seeking medical care.</p>
    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #991B1B;"><strong>Context:</strong> MaternAlert is a maternal health app they use to monitor for signs of pre-eclampsia.</p>
    </div>
  `
};
