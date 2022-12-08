import { IsNumber } from "class-validator";

export class BlockStatDto {
  @IsNumber({}, {
    message: "week must be INT"
  })
  week: number;

  @IsNumber({}, {
    message: "blockId must be INT"
  })
  blockId: number;
}
