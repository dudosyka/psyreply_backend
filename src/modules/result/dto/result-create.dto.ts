import { IsArray, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AnswerPassDto {
  @IsNumber()
  question_id: number

  @IsNumber({}, {each: true})
  answer: number[]
}

export class TestPassDto {
  @IsNumber()
  test_id: number

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => AnswerPassDto)
  answers: AnswerPassDto[]
}

export class ResultCreateDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => TestPassDto)
  tests: TestPassDto[]
}
