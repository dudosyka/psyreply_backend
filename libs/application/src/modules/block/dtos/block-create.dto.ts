import { IsNumber, IsString, MaxLength, ValidateIf } from 'class-validator';

export class BlockCreateDto {
  @IsString({
    message: 'name must be string',
  })
  @MaxLength(255)
  name: string;

  @IsString({
    message: 'description must be string',
  })
  @MaxLength(255)
  description: string;

  @IsNumber(
    {},
    {
      message: 'time must be INT',
    },
  )
  time: number;

  @IsNumber(
    {},
    {
      message: 'company_id must be INT',
    },
  )
  @ValidateIf((object, value) => value !== undefined)
  company_id?: number;

  @IsNumber(
    {},
    {
      each: true,
      message: 'tests must be INT',
    },
  )
  tests: number[];
}
