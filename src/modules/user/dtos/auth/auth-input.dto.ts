import { IsNotEmpty } from "class-validator";

export class AuthInputDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
