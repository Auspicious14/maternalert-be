import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("SMTP_HOST"),
      port: parseInt(this.configService.get("SMTP_PORT") || "587", 10),
      secure: this.configService.get("SMTP_SECURE") === "true",
      family: 4, // Force IPv4
      pool: false, // Turn off pool to debug fresh connections

      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
      debug: true,
      logger: true,
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASS"),
      },
      tls: {
        rejectUnauthorized: false, // Help with some SMTP issues
      },
    } as any);
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<boolean> {
    try {
      const from = this.configService.get("SMTP_FROM");

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
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
