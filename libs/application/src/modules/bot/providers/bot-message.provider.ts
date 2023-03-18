import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { MessageModel } from '@app/application/modules/bot/models/message.model';
import { Sequelize } from 'sequelize-typescript';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { BotUserModel } from '@app/application/modules/bot/models/bot-user.model';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { UserMessageModel } from '@app/application/modules/bot/models/user-message.model';

export class BotMessageProvider {
  constructor(private sequelize: Sequelize) {}
  async saveMessageFromClient(
    userId: number,
    msg: MessageCreateDto,
    botUserId: number,
  ): Promise<MessageModel> {
    const { type_id, ...content } = msg;

    const userBotModel = await BotUserModel.findOne({
      where: {
        id: botUserId,
      },
    });

    if (!userBotModel)
      throw new ModelNotFoundException(BotUserModel, botUserId);

    console.log(this.sequelize);

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
        recipient_id: userBotModel.chat_id,
        message_id: messageModel.id,
      },
      TransactionUtil.getHost(),
    );

    await TransactionUtil.commit();

    return messageModel;
  }
}
