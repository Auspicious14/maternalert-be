import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { EmailService } from "./email.service";

/**
 * Notifications Module
 *
 * RESPONSIBILITIES:
 * - Send care escalation alerts
 * - Template-based messaging only
 * - No dynamic medical text generation
 *
 * CLINICAL SAFETY CONSTRAINTS:
 * - No fear-based language
 * - No predictions
 * - Predefined templates only
 * - Clear, actionable guidance
 *
 * DELIVERY:
 * - Currently stub implementation (console logging)
 * - Ready for integration with email/SMS services
 * - Examples: SendGrid, Twilio, AWS SNS
 */

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
