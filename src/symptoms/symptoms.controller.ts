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

/**
 * Symptoms Controller
 *
 * ENDPOINTS:
 * - POST /symptoms - Record new symptom (authenticated)
 * - GET /symptoms - Get all symptoms (authenticated)
 * - GET /symptoms/recent - Get recent symptoms (authenticated)
 * - DELETE /symptoms/:id - Delete symptom (authenticated)
 *
 * CLINICAL SAFETY:
 * - All endpoints require authentication
 * - Users can only access their own symptoms
 * - No severity levels or scoring
 * - Atomic recording only
 */

@Controller("symptoms")
@UseGuards(JwtAuthGuard)
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  /**
   * Record a new symptom
   *
   * @param req - Request with authenticated user
   * @param createSymptomDto - Symptom data
   * @returns Created symptom record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() createSymptomDto: CreateSymptomDto
  ) {
    const userId = req.user.id;
    return this.symptomsService.create(userId, createSymptomDto);
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
