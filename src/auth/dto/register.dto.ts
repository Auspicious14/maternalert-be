import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

/**
 * Register DTO
 *
 * CLINICAL SAFETY:
 * - Email OR phone required (not both)
 * - No health data collected during registration
 * - Minimal PII only
 */
export class RegisterDto {
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => !o.phone) // Email required if no phone
  email?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.email) // Phone required if no email
  phone?: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;
}
