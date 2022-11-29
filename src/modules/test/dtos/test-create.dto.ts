import { QuestionDto } from "../../question/dtos/question.dto";
import { IsNotEmpty, IsNumber, Matches } from "class-validator";
import { ShlyapaMarkupUtil } from "../../../utils/shlyapa-markup.util";

export class TestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  type: number

  @IsNotEmpty()
  title: string

  @IsNumber()
  metric: number

  @IsNotEmpty()
  @Matches(ShlyapaMarkupUtil.validate_pattern)
  formula: string

  block_id: number

  @IsNotEmpty()
  questions: QuestionDto[]
}
