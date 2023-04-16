import { ChatNoteModel } from '@app/application/modules/bot/models/chat-note.model';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';

export class ChatNotesProvider {
  async getAll(chat_id: number): Promise<ChatNoteModel[]> {
    return await ChatNoteModel.findAll({
      where: {
        chat_id,
      },
    });
  }

  async create(
    chatId: number,
    userNoteCreateDto: UserNoteCreateDto,
  ): Promise<ChatNoteModel> {
    return await ChatNoteModel.create({
      chat_id: chatId,
      ...userNoteCreateDto,
    });
  }

  async remove(noteId: number) {
    await ChatNoteModel.destroy({
      where: {
        id: noteId,
      },
    });
  }
}
