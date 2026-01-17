import {
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { AgeRange, KnownCondition } from "@prisma/client";

enum EmergencyContactRelationshipDto {
  MIDWIFE = "MIDWIFE",
  PARTNER = "PARTNER",
  FAMILY_MEMBER = "FAMILY_MEMBER",
  OTHER = "OTHER",
}

/**
 * Create User Profile DTO
 *
 * DATA MINIMIZATION:
 * - Age range (not DOB)
 * - Pregnancy information only
 * - Enumerated conditions only
 * - Optional emergency contact (phone + relationship)
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

  @IsOptional()
  @IsEnum(EmergencyContactRelationshipDto)
  emergencyContactRelationship?: EmergencyContactRelationshipDto;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-() ]{7,20}$/, {
    message: "Emergency contact phone must be a valid phone number format",
  })
  emergencyContactPhone?: string;
}
