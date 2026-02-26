import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Forgot Password DTO
 * 
 * Supports both email and phone for reset
 */
export class ForgotPasswordDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;
}
