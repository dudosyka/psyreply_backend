import { IsNumber, IsString } from 'class-validator';

export class MessageCreateDto {
  @IsNumber()
  type_id: number;

  @IsString()
  text: string;

  @IsNumber({}, { each: true })
  attachments: number[];
}
