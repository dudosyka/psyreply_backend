import { IsNumber, IsString } from 'class-validator';

export class QuestionAnswerDto {
  @IsNumber(
    {},
    {
      message: 'id must be INT',
    },
  )
  id: number;

  @IsString({
    message: 'title must be STRING',
  })
  title: string;

  @IsNumber(
    {},
    {
      message: 'value must be INT',
    },
  )
  value: number;
}
