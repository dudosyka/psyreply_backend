import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class AuthCreateUserDto {
  @IsString()
  login: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  company_id: number;

  @IsNumber()
  group_id: number;

  @IsBoolean()
  isAdmin: boolean;
}
