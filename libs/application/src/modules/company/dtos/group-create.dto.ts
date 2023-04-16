import { IsNumber, IsString, MaxLength } from 'class-validator';

export class GroupCreateDto {
  company_id: number;

  @IsString({
    message: 'name must be STRING',
  })
  @MaxLength(255)
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
