import { IsString } from "class-validator";

export default class CreateMetricDto {
  @IsString({
    message: "must be STRING"
  })
  name: string
}
