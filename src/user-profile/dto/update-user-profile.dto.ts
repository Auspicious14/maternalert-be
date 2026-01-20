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

enum EmergencyContactRelationshipUpdateDto {
  MIDWIFE = "MIDWIFE",
  PARTNER = "PARTNER",
  FAMILY_MEMBER = "FAMILY_MEMBER",
  OTHER = "OTHER",
}

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

  @IsOptional()
  @IsEnum(EmergencyContactRelationshipUpdateDto)
  emergencyContactRelationship?: EmergencyContactRelationshipUpdateDto;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-() ]{7,20}$/, {
    message: "Emergency contact phone must be a valid phone number format",
  })
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-() ]{7,20}$/, {
    message: "Clinic phone must be a valid phone number format",
  })
  clinicPhone?: string;
}
