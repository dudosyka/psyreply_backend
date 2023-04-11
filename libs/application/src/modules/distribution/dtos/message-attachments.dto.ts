import { IsNumber, IsString, ValidateIf } from 'class-validator';

export class MessageAttachmentsDto {
  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  block_id?: number | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== undefined)
  file_id?: number | null;

  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  link?: string | null;
}
