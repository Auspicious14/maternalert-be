import { IsNotEmpty, IsString } from "class-validator";

export class RegisterPushTokenDto {
  @IsNotEmpty()
  @IsString()
  token!: string;
}
