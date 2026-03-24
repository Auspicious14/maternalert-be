import { Controller, Get, Patch, Post, Param, Body, UseGuards, Request } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RegisterPushTokenDto } from "./dto/register-push-token.dto";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req: any) {
    return this.notificationsService.getNotificationHistory(req.user.id);
  }

  @Post("register")
  async registerPushToken(@Request() req: any, @Body() dto: RegisterPushTokenDto) {
    return this.notificationsService.registerPushToken(req.user.id, dto.token);
  }

  @Patch(":id/read")
  async markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
