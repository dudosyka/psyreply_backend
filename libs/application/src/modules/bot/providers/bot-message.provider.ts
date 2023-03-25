import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { MessageModel } from '@app/application/modules/bot/models/message.model';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { BotUserModel } from '@app/application/modules/bot/models/bot-user.model';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { UserMessageModel } from '@app/application/modules/bot/models/user-message.model';
import { AttachmentDto } from '@app/application/modules/telegram/dto/attachment.dto';
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
        link: `${el.id}`,
      };
    });
  }
  async saveMessageFromClient(
    userId: number,
    msg: MessageCreateDto,
    botUserId: number,
  ): Promise<{ msg: MessageModel; botModelId: number }> {
    const { type_id, attachments, text } = msg;

    const userBotModel = await BotUserModel.findOne({
      where: {
        id: botUserId,
      },
    });

    if (!userBotModel)
      throw new ModelNotFoundException(BotUserModel, botUserId);

    const parsedAttachments = await this.processClientAttachments(attachments);

    const content = {
      text,
      attachments: parsedAttachments,
    };

    const messageModel = await MessageModel.create(
      {
        bot_message_id: null,
        type_id,
        content,
      },
      TransactionUtil.getHost(),
    ).then((res) => {
      if (!res) {
        TransactionUtil.rollback();
        throw new Error('Group creation failed');
      }
      return res;
    });

    await UserMessageModel.create(
      {
        user_id: userId,
        recipient_id: userBotModel.user_id,
        message_id: messageModel.id,
      },
      TransactionUtil.getHost(),
    );

    await TransactionUtil.commit();

    return { msg: messageModel, botModelId: userBotModel.bot_id };
  }
}
