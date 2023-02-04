import { QuestionDto } from '../../question/dtos/question.dto';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNumber,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ShlyapaMarkupUtil } from '@app/application/utils/shlyapa-markup.util';
import { Type } from 'class-transformer';

export class TestCreateDto {
  @IsNumber(
    {},
    {
      message: 'type must be INT',
    },
  )
  type: number;

  @IsString({
    message: 'title must be STRING',
  })
  title: string;

  @IsNumber(
    {},
    {
      message: 'metric must be INT',
    },
  )
  metric: number;

  @Matches(ShlyapaMarkupUtil.validate_pattern, {
    message: 'formula must be a valid ShlyapaMarkup string',
  })
  formula: string;

  @IsNumber(
    {},
    {
      message: 'block_id must be INT',
    },
  )
  @ValidateIf((object, value) => value !== undefined)
  block_id: number | null;

  @ArrayMinSize(1, {
    message: 'questions min length is 1',
  })
  @ArrayMaxSize(20, {
    message: 'questions max length is 20',
  })
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  company_id: number;
}
