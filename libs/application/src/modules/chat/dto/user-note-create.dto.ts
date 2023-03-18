import { IsString } from 'class-validator';

export class UserNoteCreateDto {
  @IsString({
    message: 'message must be STRING',
  })
  message: string;
}
