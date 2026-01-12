/**
 * Auth Response DTO
 *
 * Returned after successful login or registration
 */
export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  userId!: string;
}
