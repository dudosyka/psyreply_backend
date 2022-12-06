import { IsNotEmpty } from "class-validator";

export class BlockCreateDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  time: number;

  company_id?: number;

  @IsNotEmpty()
  tests: number[];
}
