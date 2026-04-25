import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { BrevoClient } from '@getbrevo/brevo';
import { EMAIL_TEMPLATES } from './email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly brevo: BrevoClient;
  private readonly sender = {
    name: 'MaternAlert',
    email: 'noreply@maternalert.com.ng',
  };

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.brevo = new BrevoClient({
      apiKey: this.configService.get<string>('BREVO_API_KEY') || '',
    });
  }

  private async sendWithFallback(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = `${this.configService.get('EMAIL_FROM_NAME') || this.sender.name} <${this.configService.get('EMAIL_FROM') || this.sender.email}>`;

    // Try Resend first
    try {
      const { error } = await this.resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: EMAIL_TEMPLATES.BASE(payload.html),
      });

      if (error) throw new Error(error.message);

      this.logger.log(`[EMAIL] Resend: ${payload.subject} → ${payload.to}`);
      return;
    } catch (resendError: any) {
      this.logger.warn(
        `[EMAIL] Resend failed, trying Brevo fallback: ${resendError?.message}`,
      );
    }

    // Brevo fallback
    try {
      await this.brevo.transactionalEmails.sendTransacEmail({
        subject: payload.subject,
        htmlContent: EMAIL_TEMPLATES.BASE(payload.html),
        sender: {
          name: this.configService.get('EMAIL_FROM_NAME') || this.sender.name,
          email: 'noreply@maternalert.brevo.com', // Keep old brevo verified email for fallback
        },
        to: [{ email: payload.to }],
      });
      this.logger.log(`[EMAIL] Brevo fallback: ${payload.subject} → ${payload.to}`);
    } catch (brevoError: any) {
      this.logger.error(
        `[EMAIL] Both providers failed: ${brevoError?.message}`,
      );
    }
  }

  /**
   * Generic email send for compatibility with existing code
   */
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    return this.sendWithFallback({
      to,
      subject,
      html: html || text,
    });
  }

  async sendBPAlert(
    email: string,
    bpReading: { systolic: number; diastolic: number },
    tier: 'Urgent' | 'Critical',
  ) {
    const instruction =
      tier === 'Critical'
        ? 'Seek emergency care now.'
        : 'Contact clinic within 24hrs.';

    const html = EMAIL_TEMPLATES.BP_ALERT(
      bpReading.systolic,
      bpReading.diastolic,
      tier,
      instruction,
    );

    return this.sendWithFallback({
      to: email,
      subject: '⚠️ Blood Pressure Alert — MaternAlert',
      html,
    });
  }

  async sendWeeklyBPSummary(
    email: string,
    summary: {
      averageSystolic: number;
      averageDiastolic: number;
      totalReadings: number;
      highReadingsCount: number;
      weekStartDate: string;
      weekEndDate: string;
    },
  ) {
    const html = EMAIL_TEMPLATES.WEEKLY_SUMMARY(summary);

    return this.sendWithFallback({
      to: email,
      subject: 'Your Weekly BP Summary — MaternAlert',
      html,
    });
  }

  async sendInactivityAlert(
    email: string,
    daysSinceLastReading: number,
    userName: string,
  ) {
    const html = EMAIL_TEMPLATES.INACTIVITY(daysSinceLastReading);

    return this.sendWithFallback({
      to: email,
      subject: "We haven't seen you in a while — MaternAlert",
      html,
    });
  }

  async sendTrendAlert(
    email: string,
    trendType: string,
    message: string,
    userName: string,
  ) {
    const html = EMAIL_TEMPLATES.TREND_ALERT(trendType, message);

    return this.sendWithFallback({
      to: email,
      subject: 'Blood Pressure Pattern Detected — MaternAlert',
      html,
    });
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const html = EMAIL_TEMPLATES.WELCOME(userName);

    return this.sendWithFallback({
      to: email,
      subject: 'Welcome to MaternAlert 🌿',
      html,
    });
  }

  async sendEmergencyContactAlert(
    contactEmail: string,
    contactName: string,
    userName: string,
    bpReading: { systolic: number; diastolic: number },
  ) {
    const html = EMAIL_TEMPLATES.EMERGENCY_CONTACT(
      userName,
      bpReading.systolic,
      bpReading.diastolic,
    );

    return this.sendWithFallback({
      to: contactEmail,
      subject: `[URGENT] ${userName} may need help — MaternAlert`,
      html,
    });
  }
}
