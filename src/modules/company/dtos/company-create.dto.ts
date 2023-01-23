import { IsNumber, IsString, ValidateIf } from 'class-validator';

export class CompanyCreateDto {
  @IsString({
    message: 'name must be STRING',
  })
  name: string;

  @IsNumber(
    {},
    {
      each: true,
      message: 'inputBlocks must be INT',
    },
  )
  @ValidateIf((object, value) => value !== undefined)
  inputBlocks?: number[] | null;
}
