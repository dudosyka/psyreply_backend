import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerPassDto {
  @IsNumber(
    {},
    {
      message: 'question_id must be INT',
    },
  )
  question_id: number;

  @IsNumber(
    {},
    {
      each: true,
      message: 'answer must be INT',
    },
  )
  answer: number[];
}

export class TestPassDto {
  @IsNumber(
    {},
    {
      message: 'test_id must be INT',
    },
  )
  test_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerPassDto)
  answers: AnswerPassDto[];
}

export class ResultCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestPassDto)
  tests: TestPassDto[];

  @IsNumber(
    {},
    {
      message: 'time_on_pass must be INT',
    },
  )
  time_on_pass: number;
}
