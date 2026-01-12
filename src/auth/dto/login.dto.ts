import { IsEmail, IsOptional, IsString, ValidateIf } from "class-validator";

/**
 * Login DTO
 *
 * CLINICAL SAFETY:
 * - Email OR phone for login
 * - No credential logging
 */
export class LoginDto {
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => !o.phone)
  email?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.email)
  phone?: string;

  @IsString()
  password!: string;
}
