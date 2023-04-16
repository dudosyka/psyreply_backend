import { IsString, MaxLength } from 'class-validator';

export class BotCreateDto {
  @IsString({
    message: 'name must be STRING',
  })
  @MaxLength(255)
  name: string;

  @IsString({
    message: 'token must be STRING',
  })
  @MaxLength(255)
  token: string;

  company_id: number;
}
