import {
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
} from "class-validator";
import { AgeRange, KnownCondition } from "@prisma/client";

/**
 * Update User Profile DTO
 *
 * All fields optional for partial updates
 */
export class UpdateUserProfileDto {
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(42)
  pregnancyWeeks?: number;

  @IsOptional()
  @IsBoolean()
  firstPregnancy?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(KnownCondition, { each: true })
  knownConditions?: KnownCondition[];
}
