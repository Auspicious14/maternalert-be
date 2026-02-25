import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import { SymptomsService } from "./symptoms.service";
import { CreateSymptomDto } from "./dto/create-symptom.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { HealthAssessmentService } from "../care-priority/health-assessment.service";

@Controller("symptoms")
@UseGuards(JwtAuthGuard)
export class SymptomsController {
  constructor(
    private readonly symptomsService: SymptomsService,
    private readonly healthAssessmentService: HealthAssessmentService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createSymptomDto: CreateSymptomDto
  ) {
    const userId = req.user.id;
    const symptom = await this.symptomsService.create(userId, createSymptomDto);

    // Trigger health assessment and notifications
    this.healthAssessmentService.assessAndNotify(userId);

    return symptom;
  }

  /**
   * Get all symptoms for authenticated user
   *
   * @param req - Request with authenticated user
   * @param limit - Optional limit (default: 100)
   * @returns Array of symptom records
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSymptoms(
    @Request() req: any,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    const userId = req.user.id;
    return this.symptomsService.findByUserId(userId, limit);
  }

  /**
   * Get recent symptoms (last 48 hours by default)
   *
   * @param req - Request with authenticated user
   * @param hours - Number of hours to look back
   * @returns Array of recent symptom records
   */
  @Get("recent")
  @HttpCode(HttpStatus.OK)
  async getRecent(
    @Request() req: any,
    @Query("hours", new ParseIntPipe({ optional: true })) hours?: number
  ) {
    const userId = req.user.id;
    return this.symptomsService.getRecentSymptoms(userId, hours);
  }

  /**
   * Delete a symptom record
   *
   * @param req - Request with authenticated user
   * @param id - Symptom record ID
   * @returns Success message
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any, @Param("id") id: string) {
    const userId = req.user.id;
    return this.symptomsService.delete(id, userId);
  }
}
