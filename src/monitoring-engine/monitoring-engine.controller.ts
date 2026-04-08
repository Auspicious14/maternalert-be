import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MonitoringEngineService } from './monitoring-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('monitoring-engine')
@UseGuards(JwtAuthGuard)
export class MonitoringEngineController {
  constructor(
    private readonly monitoringEngineService: MonitoringEngineService,
  ) {}

  @Get('state')
  @HttpCode(HttpStatus.OK)
  async getMonitoringState(@Request() req: any) {
    const userId = req.user.id;
    const state = await this.monitoringEngineService.getMonitoringState(userId);
    return state;
  }

  @Get('follow-ups')
  @HttpCode(HttpStatus.OK)
  async getPendingFollowUps(@Request() req: any) {
    const userId = req.user.id;
    const followUps = await this.monitoringEngineService.getPendingFollowUpTasks(
      userId,
    );
    return followUps;
  }

  @Post('follow-ups/:id/complete')
  @HttpCode(HttpStatus.OK)
  async completeFollowUp(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id; // Ensure the user owns the task
    // In a real application, you'd add a check here to ensure the task belongs to the user
    const completedTask = await this.monitoringEngineService.completeFollowUpTask(
      id,
    );
    return completedTask;
  }
}
