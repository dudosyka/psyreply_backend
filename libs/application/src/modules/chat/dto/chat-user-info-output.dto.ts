import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';

export class ChatUserInfoOutputDto {
  notes: UserNoteModel[];
}
