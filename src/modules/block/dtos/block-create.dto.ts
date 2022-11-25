import { IsNotEmpty } from "class-validator";

export class BlockCreateDto {
  @IsNotEmpty()
  name: string

  company_id?: number

  @IsNotEmpty()
  tests: number[]
}
