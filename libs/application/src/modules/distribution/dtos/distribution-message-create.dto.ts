import { MessageAttachmentsDto } from '@app/application/modules/distribution/dtos/message-attachments.dto';
import {
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DistributionMessageCreateDto {
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  text?: string;

  @IsNumber()
  type_id: number;

  @ValidateNested()
  @Type(() => MessageAttachmentsDto)
  attachments: MessageAttachmentsDto;

  @IsNumber()
  relative_id: number;
}
