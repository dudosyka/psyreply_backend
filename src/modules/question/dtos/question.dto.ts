import { QuestionAnswerDto } from "./question-answer.dto";

export class QuestionDto {
  answers: QuestionAnswerDto[];
  relative_id: number;
  coins: number;
  title: string;
  picture: string;
}
