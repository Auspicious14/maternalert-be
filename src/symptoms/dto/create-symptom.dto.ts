import { IsEnum, IsOptional, IsDateString } from "class-validator";
import { SymptomType } from "@prisma/client";

/**
 * Create Symptom Record DTO
 *
 * CLINICAL SAFETY:
 * - Enumerated symptom types only
 * - No severity levels
 * - No numeric scoring
 * - Atomic recording (one symptom per record)
 *
 * VALIDATION:
 * - symptomType must be valid enum value
 * - Optional recordedAt (defaults to now)
 */
export class CreateSymptomDto {
  @IsEnum(SymptomType)
  symptomType!: SymptomType;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
