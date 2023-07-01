import { IsString, MaxLength } from 'class-validator';
import { SignupInputDto } from '@app/application/modules/auth/dtos/signup-input.dto';
import { PartialType } from '@nestjs/mapped-types';

export class ClientSignupInputDto extends PartialType(SignupInputDto) {
  @IsString({
    message: 'fullname must be STRING',
  })
  @MaxLength(255)
  fullname: string;

  @IsString({
    message: 'phone must be STRING',
  })
  @MaxLength(255)
  phone: string;
}
