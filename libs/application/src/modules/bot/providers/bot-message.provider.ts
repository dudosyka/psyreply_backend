import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { MessageModel } from '@app/application/modules/bot/models/message.model';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import {
  AttachmentDto,
  AttachmentType,
} from '@app/application/modules/telegram/dto/attachment.dto';
import { FilesModel } from '@app/application/modules/files/models/files.model';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';
import { ChatDirection } from '@app/application/modules/chat/dto/chat-direction.enum';

export class BotMessageProvider {
  private async processClientAttachments(
    attachments: number[],
  ): Promise<AttachmentDto[]> {
    const files = await FilesModel.findAll({
      where: {
        id: attachments,
      },
    });

    return files.map((el) => {
      return {
        id: null,
        type: AttachmentType.FILE,
        link: `${el.id}`,
      };
    });
  }

  async saveMessageFromClient(
    chatId: number,
    msg: MessageCreateDto,
  ): Promise<{
    msg: MessageModel;
    botModelId: number;
    chatMessageModel: ChatMessageModel;
  }> {
    console.log(msg);
    const { type_id, attachments, text, link, distribution_message_type } = msg;

    const chatModel = await ChatModel.findOne({
      where: {
        id: chatId,
      },
      include: [ChatBotModel],
    });

    if (!chatModel) {
      await TransactionUtil.rollback();
      throw new ModelNotFoundException(ChatModel, chatId);
    }

    const parsedAttachments: AttachmentDto[] =
      await this.processClientAttachments(attachments);

    const content = {
      text,
      attachments: parsedAttachments,
    };

    if (link) {
      content.attachments.push({
        id: null,
        type:
          distribution_message_type == 3
            ? AttachmentType.LINK
            : AttachmentType.TEST,
        link: link,
      });
    }

    const messageModel = await MessageModel.create(
      {
        type_id,
        content,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('Message creation failed');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    const chatMessageModel = await ChatMessageModel.create(
      {
        message_id: messageModel.id,
        chat_id: chatModel.id,
        direction: ChatDirection.COMPANY_TO_USER,
        message: messageModel,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('Message creation failed');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    await TransactionUtil.commit();

    return {
      msg: messageModel,
      botModelId: chatModel.bot_chat.bot_id,
      chatMessageModel,
    };
  }
}
