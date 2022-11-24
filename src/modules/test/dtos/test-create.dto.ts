import { QuestionDto } from "../../question/dtos/question.dto";
import { IsNotEmpty, IsNumber, Matches } from "class-validator";

export class TestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  type: number

  @IsNotEmpty()
  title: string

  @IsNotEmpty()
  metric: number

  @IsNotEmpty()
  @Matches('^(\\+((\\$\\d+)|(\\(((\\d+)|(\\$\\d+))[+*-]\\$\\d+\\))|(\\(\\-?\\$\\d+\\))))+$')
  formula: string

  block_id: number

  @IsNotEmpty()
  questions: QuestionDto[]
}
