import { IsNumber, IsString } from 'class-validator';

export class GroupCreateDto {
  company_id: number;

  @IsString({
    message: 'name must be STRING',
  })
  name: string;

  @IsNumber(
    {},
    {
      each: true,
      message: 'users must be array of INT',
    },
  )
  users: number[];
}
