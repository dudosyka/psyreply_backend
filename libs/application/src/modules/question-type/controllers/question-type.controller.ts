import { Controller, Get, HttpCode, Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { QuestionTypeProvider } from '../providers/question-type.provider';
import { QuestionTypeModel } from '../models/question-type.model';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('question-type')
export class QuestionTypeController {
  constructor(
    @Inject(QuestionTypeProvider)
    private questionTypeProvider: QuestionTypeProvider,
  ) {}

  @Get()
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(): Promise<HttpResponseFilter<QuestionTypeModel[]>> {
    return HttpResponseFilter.response<QuestionTypeModel[]>(
      await this.questionTypeProvider.getAll(),
      ResponseStatus.SUCCESS,
    );
  }
}
