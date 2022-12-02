import { PartialType } from "@nestjs/mapped-types";
import { TestCreateDto } from "./test-create.dto";

export class TestUpdateDto extends PartialType(TestCreateDto) {
  id: number;
}
