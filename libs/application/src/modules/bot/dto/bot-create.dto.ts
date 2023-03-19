import { IsString } from 'class-validator';

export class BotCreateDto {
  @IsString({
    message: 'name must be STRING',
  })
  name: string;

  @IsString({
    message: 'token must be STRING',
  })
  token: string;
  company_id: number;
}
