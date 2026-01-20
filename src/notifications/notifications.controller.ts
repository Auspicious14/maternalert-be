import { Controller, Get, Patch, Param, UseGuards, Request } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req: any) {
    return this.notificationsService.getNotificationHistory(req.user.id);
  }

  @Patch(":id/read")
  async markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
