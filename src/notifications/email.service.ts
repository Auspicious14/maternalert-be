import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google, gmail_v1 } from "googleapis";
import * as nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

/**
 * EmailService — sends via Gmail REST API (HTTPS port 443).
 *
 * Why not SMTP?
 * Cloud/container hosts (Railway, Render, Fly.io, etc.) block outbound
 * SMTP ports 587 and 465. The Gmail API uses HTTPS which is never blocked.
 *
 * Required env vars:
 *   GMAIL_CLIENT_ID      – OAuth2 client ID from Google Cloud Console
 *   GMAIL_CLIENT_SECRET  – OAuth2 client secret
 *   GMAIL_REFRESH_TOKEN  – Long-lived refresh token (see setup guide below)
 *   GMAIL_USER           – The Gmail address to send from (e.g. maternalert@gmail.com)
 *   SMTP_FROM            – Display name + address (e.g. MaternAlert <maternalert@gmail.com>)
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private gmail!: gmail_v1.Gmail;
  private readonly fromAddress: string;
  private readonly gmailUser: string;
  private ready = false;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>("SMTP_FROM") ||
      "MaternAlert <maternalert@gmail.com>";

    this.gmailUser =
      this.configService.get<string>("GMAIL_USER") || "maternalert@gmail.com";
  }

  onModuleInit() {
    const clientId = this.configService.get<string>("GMAIL_CLIENT_ID");
    const clientSecret = this.configService.get<string>("GMAIL_CLIENT_SECRET");
    const refreshToken = this.configService.get<string>("GMAIL_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.error(
        "Gmail API credentials missing. " +
          "Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN in .env. " +
          "See: https://developers.google.com/gmail/api/quickstart",
      );
      return;
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      // Redirect URI used only during the one-time token exchange
      "https://developers.google.com/oauthplayground",
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    this.gmail = google.gmail({ version: "v1", auth: oauth2Client });
    this.ready = true;
    this.logger.log("Gmail API client initialised ✅");
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<boolean> {
    if (!this.ready) {
      this.logger.error(
        "Gmail API not initialised — check env vars. Email NOT sent.",
      );
      return false;
    }

    try {
      // Build an RFC 2822 raw message using nodemailer (encoding only, no SMTP)
      const rawMessage = await this.buildRawMessage({
        from: this.fromAddress,
        to,
        subject,
        text,
        html: html || text,
      });

      const res = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: rawMessage },
      });

      this.logger.log(`Email sent via Gmail API ✅ id=${res.data.id} to=${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Uses nodemailer purely as an RFC 2822 encoder — no SMTP connection is made.
   */
  private buildRawMessage(mailOptions: Mail.Options): Promise<string> {
    return new Promise((resolve, reject) => {
      // Null transport: builds the message but never connects to any server
      const transporter = nodemailer.createTransport({ jsonTransport: true });

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return reject(err);

        // jsonTransport gives us the raw message envelope — encode to base64url
        const raw = Buffer.from(info.message)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        resolve(raw);
      });
    });
  }
}
