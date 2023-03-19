import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '../../user/models/user.model';
import { BaseProvider } from '../../base/base.provider';
import { BotModel } from '../../bot/models/bot.model';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { MessageModel } from '../../bot/models/message.model';
import { UserMessageModel } from '../../bot/models/user-message.model';
import { Op } from 'sequelize';
import { BotUserModel } from '../../bot/models/bot-user.model';
import { Socket } from 'socket.io';
import { ChatUserInfoOutputDto } from '@app/application/modules/chat/dto/chat-user-info-output.dto';
import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';
import { ChatNotesProvider } from '@app/application/modules/chat/providers/chat-notes.provider';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';

@Injectable()
export class ChatProvider extends BaseProvider<BotModel> {
  constructor(
    @Inject(ChatNotesProvider) private chatNotesProvider: ChatNotesProvider,
  ) {
    super(BotModel);
  }

  async getSubscribers(botId: number): Promise<UserModel[]> {
    const bot = await this.getOne({
      where: {
        id: botId,
      },
      include: [UserModel],
    });

    return bot.subscribers;
  }

  async getByCompany(companyId: number): Promise<BotModel[]> {
    return await this.getAll({
      attributes: ['id', 'name', 'telegram_id', 'createdAt', 'updatedAt'],
      where: {
        company_id: companyId,
      },
    });
  }

  async getByUser(userId: number): Promise<BotModel[]> {
    const userModel = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (!userModel) throw new ModelNotFoundException(UserModel, userId);

    return await this.getByCompany(userModel.company_id);
  }

  async getMessages(
    botId: number,
    userId: number,
  ): Promise<UserMessageModel[]> {
    const userModel = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (!userModel) throw new ModelNotFoundException(UserModel, userId);

    const userBotModel = await BotUserModel.findOne({
      where: {
        bot_id: botId,
        user_id: userId,
      },
    });

    if (!userBotModel) throw new ModelNotFoundException(BotUserModel, null);

    return await UserMessageModel.findAll({
      where: {
        [Op.or]: [
          {
            recipient_id: userId,
          },
          {
            recipient_id: null,
            user_id: userId,
          },
        ],
      },
      include: [MessageModel],
    });
  }

  async getUserBotModel(botUserId: number): Promise<BotUserModel> | never {
    const userBotModel = await BotUserModel.findOne({
      where: {
        id: botUserId,
      },
    });

    if (!userBotModel)
      throw new ModelNotFoundException(BotUserModel, botUserId);

    return userBotModel;
  }
  async getChatInfo(botUserId: number): Promise<ChatUserInfoOutputDto> {
    const userBotModel = await this.getUserBotModel(botUserId);

    const notes = await this.chatNotesProvider.getAll(userBotModel.id);

    return {
      notes,
    };
  }

  async createNote(
    botUserId: number,
    userNoteCreateDto: UserNoteCreateDto,
  ): Promise<UserNoteModel> {
    const userBotModel = await this.getUserBotModel(botUserId);

    return await this.chatNotesProvider.create(
      userBotModel.id,
      userNoteCreateDto,
    );
  }

  async removeNote(botUserId: number, noteId: number) {
    await this.getUserBotModel(botUserId);

    await this.chatNotesProvider.remove(noteId);
  }

  joinRoom(client: Socket, chatId: string) {
    // WebSocketUtil.emitter
    client.join(chatId);
  }
}
