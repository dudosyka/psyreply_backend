import { IsNotEmpty } from "class-validator";

export class BlockCreateDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  tests: number[]
}
