import { IsNumber, IsString } from 'class-validator';

export class MessageCreateDto {
  //1 - text, 2 - photo, 3 - video, 4 - document, 5 - link (web, block etc)
  @IsNumber()
  type_id: number;

  @IsString()
  text: string;

  @IsNumber({}, { each: true })
  attachments: number[];

  link?: string | null;

  distribution_message_type?: number | null;
}
