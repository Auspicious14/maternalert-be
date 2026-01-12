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
import { BloodPressureService } from "./blood-pressure.service";
import { CreateBloodPressureDto } from "./dto/create-blood-pressure.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Blood Pressure Controller
 *
 * ENDPOINTS:
 * - POST /blood-pressure - Log new BP reading (authenticated)
 * - GET /blood-pressure - Get all readings (authenticated)
 * - GET /blood-pressure/latest - Get latest reading (authenticated)
 * - DELETE /blood-pressure/:id - Delete reading (authenticated)
 *
 * CLINICAL SAFETY:
 * - All endpoints require authentication
 * - Users can only access their own readings
 * - No interpretation or labeling of readings
 * - Neutral data handling only
 */

@Controller("blood-pressure")
@UseGuards(JwtAuthGuard)
export class BloodPressureController {
  constructor(private readonly bloodPressureService: BloodPressureService) {}

  /**
   * Log a new blood pressure reading
   *
   * @param req - Request with authenticated user
   * @param createBloodPressureDto - BP data (systolic/diastolic)
   * @returns Created reading
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createBloodPressureDto: CreateBloodPressureDto
  ) {
    const userId = req.user.id;
    return this.bloodPressureService.create(userId, createBloodPressureDto);
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
