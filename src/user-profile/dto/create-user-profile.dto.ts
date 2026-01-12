import { IsEnum, IsBoolean, IsInt, Min, Max, IsArray } from "class-validator";
import { AgeRange, KnownCondition } from "@prisma/client";

/**
 * Create User Profile DTO
 *
 * DATA MINIMIZATION:
 * - Age range (not DOB)
 * - Pregnancy information only
 * - Enumerated conditions only
 *
 * VALIDATION:
 * - Pregnancy weeks: 0-42 (typical pregnancy duration)
 * - All fields required for profile creation
 */
export class CreateUserProfileDto {
  @IsEnum(AgeRange)
  ageRange!: AgeRange;

  @IsInt()
  @Min(0, { message: "Pregnancy weeks must be at least 0" })
  @Max(42, { message: "Pregnancy weeks must not exceed 42" })
  pregnancyWeeks!: number;

  @IsBoolean()
  firstPregnancy!: boolean;

  @IsArray()
  @IsEnum(KnownCondition, { each: true })
  knownConditions!: KnownCondition[];
}
