import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CarePriorityService } from "./care-priority.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Care Priority Controller
 *
 * ENDPOINT:
 * - GET /care-priority - Get current care priority (authenticated, read-only)
 *
 * CLINICAL SAFETY:
 * - Read-only endpoint (no POST/PUT/DELETE)
 * - Returns priority level and safe next step message
 * - Non-diagnostic language only
 * - No explanation of medical reasoning
 * - Template-based messaging
 *
 * RESPONSE FORMAT:
 * {
 *   priority: 'ROUTINE' | 'INCREASED_MONITORING' | 'URGENT_REVIEW' | 'EMERGENCY',
 *   message: 'Safe next step message',
 *   reasons: ['Factor 1', 'Factor 2'],
 *   timestamp: '2024-01-01T00:00:00.000Z'
 * }
 */

@Controller("care-priority")
@UseGuards(JwtAuthGuard)
export class CarePriorityController {
  constructor(private readonly carePriorityService: CarePriorityService) {}

  /**
   * Get current care priority for authenticated user
   *
   * CONSTRAINTS:
   * - Read-only operation
   * - Calculates priority based on latest data
   * - Returns predefined safe message
   * - No diagnostic information
   *
   * @param req - Request with authenticated user
   * @returns Care priority result with safe message
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCarePriority(@Request() req: any) {
    const userId = req.user.id;

    // Calculate care priority
    const result = await this.carePriorityService.calculateCarePriority(userId);

    // Get safe next step message
    const message = this.carePriorityService.getSafeNextStepMessage(
      result.priority
    );

    return {
      priority: result.priority,
      message,
      reasons: result.reasons,
      timestamp: result.timestamp,
    };
  }
}
