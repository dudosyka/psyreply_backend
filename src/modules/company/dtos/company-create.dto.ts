import { IsNotEmpty } from "class-validator";


export class CompanyCreateDto {
  @IsNotEmpty()
  name: string
}
