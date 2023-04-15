import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { MessageModel } from '@app/application/modules/bot/models/message.model';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { BotUserModel } from '@app/application/modules/bot/models/bot-user.model';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { UserMessageModel } from '@app/application/modules/bot/models/user-message.model';
import {
  AttachmentDto,
  AttachmentType,
} from '@app/application/modules/telegram/dto/attachment.dto';
import { FilesModel } from '@app/application/modules/files/models/files.model';

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
    userId: number,
    msg: MessageCreateDto,
    botUserId: number,
  ): Promise<{ msg: MessageModel; botModelId: number }> {
    console.log(msg);
    const { type_id, attachments, text, link, distribution_message_type } = msg;

    const userBotModel = await BotUserModel.findOne({
      where: {
        id: botUserId,
      },
    });

    if (!userBotModel) {
      await TransactionUtil.rollback();
      throw new ModelNotFoundException(BotUserModel, botUserId);
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
        bot_message_id: null,
        bot_id: userBotModel.bot_id,
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

    await UserMessageModel.create(
      {
        user_id: userId,
        bot_id: messageModel.bot_id,
        recipient_id: userBotModel.user_id,
        message_id: messageModel.id,
      },
      TransactionUtil.getHost(),
    ).catch((err) => {
      console.log(err);
      TransactionUtil.rollback();
      throw err;
    });

    await TransactionUtil.commit();

    return { msg: messageModel, botModelId: userBotModel.bot_id };
  }
}
