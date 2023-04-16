import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ClientNewMessageDto {
  @ValidateNested()
  @Type(() => MessageCreateDto)
  msg: MessageCreateDto;

  @IsNumber()
  chatId: number;

  @IsNumber()
  chatModelId: number;
}
