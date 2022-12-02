import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { QuestionTypeProvider } from "../providers/question-type.provider";
import { QuestionTypeModel } from "../models/question-type.model";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("question-type")
export class QuestionTypeController {
  constructor(
    @Inject(QuestionTypeProvider) private questionTypeProvider: QuestionTypeProvider
  ) {
  }

  @Get()
  public getAll(): Promise<QuestionTypeModel[]> {
    return this.questionTypeProvider.getAll();
  }
}
