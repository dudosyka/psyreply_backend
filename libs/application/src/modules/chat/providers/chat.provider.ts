import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '../../user/models/user.model';
import { BaseProvider } from '../../base/base.provider';
import { BotModel } from '../../bot/models/bot.model';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { MessageModel } from '../../bot/models/message.model';
import { Socket } from 'socket.io';
import { ChatUserInfoOutputDto } from '@app/application/modules/chat/dto/chat-user-info-output.dto';
import { ChatNoteModel } from '@app/application/modules/bot/models/chat-note.model';
import { ChatNotesProvider } from '@app/application/modules/chat/providers/chat-notes.provider';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { MessageClientOutputDto } from '@app/application/modules/chat/dto/message-client-output.dto';

@Injectable()
export class ChatProvider extends BaseProvider<BotModel> {
  constructor(
    @Inject(ChatNotesProvider) private chatNotesProvider: ChatNotesProvider,
  ) {
    super(BotModel);
  }

  async getSubscribers(companyId: number): Promise<ChatModel[]> {
    return await ChatModel.findAll({
      where: {
        company_id: companyId,
      },
      include: [UserModel, ChatBotModel],
    });
  }

  async getByCompany(companyId: number): Promise<BotModel[]> {
    return await this.getAll({
      attributes: [
        'id',
        'name',
        'token',
        'telegram_id',
        'createdAt',
        'updatedAt',
      ],
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

  async getMessages(chatId: number): Promise<MessageClientOutputDto[]> {
    return (
      await ChatMessageModel.findAll({
        where: {
          chat_id: chatId,
        },
        include: [MessageModel],
      })
    ).map((el) => {
      return {
        id: el.message.id,
        chat_id: el.chat_id,
        direction: el.direction,
        type_id: el.message.type_id,
        content: el.message.content,
        createdAt: el.message.createdAt,
        updatedAt: el.message.updatedAt,
      };
    });
  }

  async getChatModel(chatId: number): Promise<ChatModel> | never {
    const chatModel = await ChatModel.findOne({
      where: {
        id: chatId,
      },
    });

    if (!chatModel) throw new ModelNotFoundException(ChatModel, chatId);

    return chatModel;
  }

  async getChatInfo(chatId: number): Promise<ChatUserInfoOutputDto> {
    const chatModel = await this.getChatModel(chatId);

    const notes = await this.chatNotesProvider.getAll(chatModel.id);

    return {
      notes,
    };
  }

  async createNote(
    chatId: number,
    userNoteCreateDto: UserNoteCreateDto,
  ): Promise<ChatNoteModel> {
    const chatModel = await this.getChatModel(chatId);

    return await this.chatNotesProvider.create(chatModel.id, userNoteCreateDto);
  }

  async removeNote(chatId: number, noteId: number) {
    //Check that chat exists
    await this.getChatModel(chatId);

    await this.chatNotesProvider.remove(noteId);
  }

  joinRoom(client: Socket, chatId: string) {
    console.log(chatId, typeof chatId);
    // WebSocketUtil.emitter
    client.join(chatId);
  }
}
