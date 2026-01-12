import { IsString } from "class-validator";

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
