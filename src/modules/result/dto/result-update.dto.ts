import { IsBoolean, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ResultDataType {
  @IsNumber({}, {
    message: "metric_id must be INT"
  })
  metric_id: number;

  @IsNumber({}, {
    message: "value must be INT"
  })
  value: number;
}

export class ResultUpdateDto {
  @IsBoolean({
    message: "approved must be BOOLEAN"
  })
  approved: boolean;

  @ValidateNested({
    each: true,
  })
  @Type(() => ResultDataType)
  newData: ResultDataType[];
}
