import { QuestionAnswerDto } from "./question-answer.dto";

export class QuestionDto {
  answers: QuestionAnswerDto[];
  coins: number;
  title: string;
  picture: string
}
