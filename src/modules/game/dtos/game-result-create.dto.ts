import { IsNumber } from "class-validator";

export class GameResultCreateDto {
  @IsNumber({}, {
    message: "user_id must be INT"
  })
  user_id: number;

  @IsNumber({}, {
    message: "metric_id must be INT"
  })
  metric_id: number;

  @IsNumber({}, {
    message: "value must be INT"
  })
  value: number;
}
