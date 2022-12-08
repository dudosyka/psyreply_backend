import { IsNumber, IsString, ValidateIf } from "class-validator";

export class BlockCreateDto {
  @IsString({
    message: "name must be string"
  })
  name: string;

  @IsNumber({}, {
    message: "time must be INT"
  })
  time: number;

  @IsNumber({}, {
    message: "company_id must be INT"
  })
  @ValidateIf((object, value) => value !== undefined)
  company_id?: number;


  @IsNumber({}, {
    each: true,
    message: "tests must be INT"
  })
  tests: number[];
}
