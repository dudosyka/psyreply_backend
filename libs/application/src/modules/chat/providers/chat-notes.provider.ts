import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';

export class ChatNotesProvider {
  async getAll(userBotModelId: number): Promise<UserNoteModel[]> {
    return await UserNoteModel.findAll({
      where: {
        bot_user_model_id: userBotModelId,
      },
    });
  }

  async create(
    userBotModelId: number,
    userNoteCreateDto: UserNoteCreateDto,
  ): Promise<UserNoteModel> {
    return await UserNoteModel.create({
      bot_user_model_id: userBotModelId,
      ...userNoteCreateDto,
    });
  }

  async remove(noteId: number) {
    await UserNoteModel.destroy({
      where: {
        id: noteId,
      },
    });
  }
}
