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
  Inject,
  forwardRef,
} from "@nestjs/common";
import { BloodPressureService } from "./blood-pressure.service";
import { CreateBloodPressureDto } from "./dto/create-blood-pressure.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { HealthAssessmentService } from "../care-priority/health-assessment.service";

@Controller("blood-pressure")
@UseGuards(JwtAuthGuard)
export class BloodPressureController {
  constructor(
    private readonly bloodPressureService: BloodPressureService,
    @Inject(forwardRef(() => HealthAssessmentService))
    private readonly healthAssessmentService: HealthAssessmentService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createBloodPressureDto: CreateBloodPressureDto
  ) {
    const userId = req.user.id;
    const reading = await this.bloodPressureService.create(
      userId,
      createBloodPressureDto
    );

    // Trigger health assessment and notifications (don't await to avoid blocking response)
    this.healthAssessmentService.assessAndNotify(userId);

    return reading;
  }

  /**
   * Get all BP readings for authenticated user
   *
   * @param req - Request with authenticated user
   * @param limit - Optional limit (default: 50)
   * @returns Array of BP readings
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getReadings(
    @Request() req: any,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    const userId = req.user.id;
    return this.bloodPressureService.findByUserId(userId, limit);
  }

  /**
   * Get latest BP reading
   *
   * @param req - Request with authenticated user
   * @returns Latest BP reading or null
   */
  @Get("latest")
  @HttpCode(HttpStatus.OK)
  async getLatest(@Request() req: any) {
    const userId = req.user.id;
    return this.bloodPressureService.getLatestReading(userId);
  }

  /**
   * Delete a BP reading
   *
   * @param req - Request with authenticated user
   * @param id - Reading ID
   * @returns Success message
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any, @Param("id") id: string) {
    const userId = req.user.id;
    return this.bloodPressureService.delete(id, userId);
  }
}
