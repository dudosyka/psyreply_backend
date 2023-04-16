import { IsString, MaxLength } from 'class-validator';

export class SignupInputDto {
  @IsString({
    message: 'email must be STRING',
  })
  @MaxLength(255)
  email: string;

  @IsString({
    message: 'login must be STRING',
  })
  @MaxLength(255)
  login: string;

  @IsString({
    message: 'password must be STRING',
  })
  @MaxLength(255)
  password: string;

  @IsString({
    message: 'companyName must be STRING',
  })
  @MaxLength(255)
  companyName: string;
}
