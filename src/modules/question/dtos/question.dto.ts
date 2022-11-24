import { QuestionAnswerDto } from "./question-answer.dto";
import { IsNotEmpty } from "class-validator";

export class QuestionDto {
  answers: QuestionAnswerDto[];
  coins: number;
  title: string;
  picture: string
}
