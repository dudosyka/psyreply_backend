import { IsNotEmpty, IsNumber, ValidateIf } from "class-validator";


export class CompanyCreateDto {
  @IsNotEmpty()
  name: string

  @IsNumber({}, {each: true})
  @ValidateIf((object, value) => value !== undefined)
  inputBlocks?: number[] | null
}
