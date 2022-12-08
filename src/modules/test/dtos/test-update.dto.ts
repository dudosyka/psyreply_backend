import { PartialType } from "@nestjs/mapped-types";
import { TestCreateDto } from "./test-create.dto";
import { IsNumber } from "class-validator";

export class TestUpdateDto extends PartialType(TestCreateDto) {
  @IsNumber({}, {
    message: "id must be INT"
  })
  id: number;
}
