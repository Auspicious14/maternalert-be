import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { EducationService } from "./education.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Education Controller
 *
 * ENDPOINTS:
 * - GET /education - List all articles (optional category filter)
 * - GET /education/:id - Get specific article
 *
 * RESTRICTIONS:
 * - Authenticated users only
 * - Read-only access
 */
@Controller("education")
@UseGuards(JwtAuthGuard)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query("category") category?: string) {
    if (category) {
      return this.educationService.findByCategory(category);
    }
    return this.educationService.findAll();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  findOne(@Param("id") id: string) {
    return this.educationService.findOne(id);
  }
}
