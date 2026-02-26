import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Reset Password DTO
 * 
 * Used with a reset token to set a new password
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword!: string;
}
