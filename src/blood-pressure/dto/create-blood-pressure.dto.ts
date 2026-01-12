import { IsInt, Min, Max, IsOptional, IsDateString } from "class-validator";

/**
 * Create Blood Pressure Reading DTO
 *
 * VALIDATION RULES:
 * - Systolic: 60-260 mmHg (physiologically possible range)
 * - Diastolic: 40-160 mmHg (physiologically possible range)
 * - Optional recordedAt (defaults to now)
 *
 * CLINICAL SAFETY:
 * - No interpretation or labeling
 * - Neutral data collection only
 * - Manual entry only
 */
export class CreateBloodPressureDto {
  @IsInt()
  @Min(60, { message: "Systolic must be at least 60 mmHg" })
  @Max(260, { message: "Systolic must not exceed 260 mmHg" })
  systolic!: number;

  @IsInt()
  @Min(40, { message: "Diastolic must be at least 40 mmHg" })
  @Max(160, { message: "Diastolic must not exceed 160 mmHg" })
  diastolic!: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
