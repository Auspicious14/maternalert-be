import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      const from = this.configService.get('SMTP_FROM');
      
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || text,
      });

      this.logger.log(`Email sent successfully: ${info.messageId} to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }
}
