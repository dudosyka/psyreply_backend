import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';

export class BotUserInfoOutputDto {
  notes: UserNoteModel[];
}
