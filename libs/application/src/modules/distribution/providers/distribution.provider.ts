import { DistributionCreateDto } from '@app/application/modules/distribution/dtos/distribution-create.dto';
import { DistributionModel } from '@app/application/modules/distribution/models/distribution.model';
import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { Sequelize } from 'sequelize-typescript';
import { ModelCreationFailedException } from '@app/application/exceptions/model-creation-failed.exception';
import { DistributionBlockModel } from '@app/application/modules/distribution/models/distribution-block.model';
import { DistributionMessageModel } from '@app/application/modules/distribution/models/distribution-message.model';
import { UserModel } from '@app/application/modules/user/models/user.model';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { DistributionContactsModels } from '@app/application/modules/distribution/models/distribution-contacts.models';
import { BaseProvider } from '@app/application/modules/base/base.provider';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { Inject } from '@nestjs/common';
import { BotProvider } from '@app/application/modules/bot/providers/bot.provider';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { BlockProvider } from '@app/application/modules/block/providers/block.provider';
import { ChatGateway } from '@app/application/modules/chat/providers/chat.gateway';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { DistributionGreetingsUpdateDto } from '@app/application/modules/distribution/dtos/distribution-greetings-update.dto';
import { DistributionBlockCreateDto } from '@app/application/modules/distribution/dtos/distribution-block-create.dto';
import { BotModel } from '@app/application/modules/bot/models/bot.model';

export class DistributionProvider extends BaseProvider<DistributionModel> {
  constructor(
    @Inject(BotProvider) private botProvider: BotProvider,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    private sequelize: Sequelize,
    private chatGateway: ChatGateway,
  ) {
    super(DistributionModel);
  }

  private getNextCallTimestamp(sendTime: string, dayPeriod: number) {
    const cur = new Date();
    const nextCallString = `${cur.getFullYear()}-${
      cur.getMonth() + 1
    }-${cur.getDate()} ${sendTime}`;
    const nextCallDate = new Date(nextCallString);
    if (Date.now() > nextCallDate.getTime()) {
      return nextCallDate.getTime() + dayPeriod * 3600 * 24 * 1000;
    } else {
      return nextCallDate.getTime();
    }
  }

  private async createBlocks(
    distributionModel: DistributionModel,
    blocks: DistributionBlockCreateDto[],
  ) {
    await Promise.all(
      blocks.map(async (block) => {
        const data = {
          name: block.name,
          relative_id: block.relative_id,
          distribution_id: distributionModel.id,
        };
        const blockModel = await DistributionBlockModel.create(
          data,
          TransactionUtil.getHost(),
        )
          .then((res) => {
            if (!res) {
              throw new ModelCreationFailedException<DistributionBlockModel>(
                data,
                new DistributionBlockModel(),
              );
            }
            return res;
          })
          .catch((err) => {
            throw err;
          });

        blockModel.messages = await DistributionMessageModel.bulkCreate(
          block.messages.map((msg) => {
            return {
              text: msg.text,
              type_id: msg.type_id,
              relative_id: msg.relative_id,
              attachments: msg.attachments,
              block_id: blockModel.id,
            };
          }),
          TransactionUtil.getHost(),
        )
          .then((res) => {
            if (!res) {
              throw new ModelCreationFailedException<DistributionMessageModel>(
                data,
                new DistributionMessageModel(),
              );
            }
            return res;
          })
          .catch((err) => {
            throw err;
          });

        return blockModel;
      }),
    ).catch((err) => {
      TransactionUtil.rollback();
      throw err;
    });
  }

  async create(
    company_id: number,
    distributionDto: DistributionCreateDto,
    id?: number | null,
  ): Promise<DistributionModel> {
    if (!TransactionUtil.isSet())
      TransactionUtil.setHost(await this.sequelize.transaction());

    const { blocks, recipients, ...data } = distributionDto;

    const checkUsers = await UserModel.findAll({
      where: {
        id: recipients,
      },
    });

    if (checkUsers.length < recipients.length) {
      await TransactionUtil.rollback();
      throw new ModelNotFoundException(UserModel, null);
    }

    const next_call = this.getNextCallTimestamp(
      data.send_time,
      data.day_period,
    );

    const model = await DistributionModel.create(
      {
        id,
        ...data,
        company_id,
        next_call,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          throw new ModelCreationFailedException<DistributionModel>(
            data,
            new DistributionModel(),
          );
        }
        return res;
      })
      .catch((err) => {
        console.log(err);
        TransactionUtil.rollback();
        throw err;
      });

    await DistributionContactsModels.bulkCreate(
      recipients.map((el) => {
        return {
          user_id: el,
          distribution_id: model.id,
        };
      }),
      TransactionUtil.getHost(),
    ).catch((err) => {
      TransactionUtil.rollback();
      throw err;
    });

    await this.createBlocks(model, distributionDto.blocks).catch((err) => {
      TransactionUtil.rollback();
      throw err;
    });

    await TransactionUtil.commit();

    return model;
  }

  private async sendDistribution(
    distributionModel: DistributionModel,
    distributionContacts: UserModel[] = [],
  ) {
    //We reverse because tg send reversed ^_^
    const blocks = distributionModel.blocks.sort((f, s) => {
      return s.relative_id - f.relative_id;
    });
    const contacts =
      distributionContacts.length > 0
        ? distributionContacts
        : distributionModel.contacts;
    TransactionUtil.setHost(await this.sequelize.transaction());
    await Promise.all(
      contacts.map(async (user) => {
        await Promise.all(
          blocks.map(async (block) => {
            await Promise.all(
              block.messages.map(async (msg: DistributionMessageModel) => {
                const attachments: {
                  link: string;
                  block_id: number;
                  file_id: number;
                  title: string;
                } = JSON.parse(msg.attachments);
                let newMessageDto: MessageCreateDto;
                switch (msg.type_id) {
                  case 1: //Text
                    newMessageDto = {
                      type_id: 1,
                      title: msg.text ?? '',
                      text: msg.text,
                      attachments: [],
                      link: '',
                    };
                    break;
                  case 2: //Media
                    newMessageDto = {
                      type_id: 2, //Hard coded photo type,
                      title: msg.text ?? '',
                      text: msg.text ? msg.text : '',
                      attachments: [attachments.file_id],
                      link: '',
                    };
                    break;
                  case 3: //Link
                    newMessageDto = {
                      type_id: 5,
                      title: attachments.title ?? '',
                      text: msg.text ? msg.text : '',
                      attachments: [],
                      link: attachments.link,
                      distribution_message_type: 3,
                    };
                    break;
                  case 4: //Test
                    const links =
                      await this.blockProvider.createLinkForDistribution(
                        attachments.block_id,
                        user,
                      );

                    newMessageDto = {
                      type_id: 5,
                      text: msg.text ? msg.text : '',
                      title: attachments.title ?? '',
                      attachments: [],
                      link: links.link,
                      distribution_message_type: 4,
                    };

                    break;
                  default:
                    break;
                }
                const messageOutputDto =
                  await this.botProvider.newMessageInside({
                    msg: newMessageDto,
                    chatModelId: user.chatModel.id,
                    chatId: user.jetBotId,
                  });

                this.chatGateway.sendTo(
                  user.jetBotId.toString(),
                  messageOutputDto,
                );
              }),
            ).catch((err) => {
              console.log(err);
            });
          }),
        );
      }),
    );
    await TransactionUtil.commit();
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  @Cron(CronExpression.EVERY_30_SECONDS)
  private async fetchDistribution() {
    const distributionOnSend = await DistributionModel.findAll({
      where: {
        next_call: {
          [Op.lte]: Date.now(),
        },
        greetings: false,
      },
      include: [
        {
          model: UserModel,
          include: [{ model: ChatModel, include: [ChatBotModel] }],
        },
        { model: DistributionBlockModel, include: [DistributionMessageModel] },
      ],
    });
    distributionOnSend.forEach((el) => {
      const cur = new Date();
      const nextCallString = `${cur.getFullYear()}-${
        cur.getMonth() + 1
      }-${cur.getDate()} ${el.send_time}`;
      const nextCallDate = new Date(nextCallString);
      //If it for one time we set nextCall on 9999 days
      if (el.onetime)
        el.next_call = nextCallDate.getTime() + 9999 * 3600 * 24 * 1000;
      else
        el.next_call =
          nextCallDate.getTime() + el.day_period * 3600 * 24 * 1000;
      el.save();
      this.sendDistribution(el);
    });
  }

  public async getOne(id: number): Promise<DistributionModel> {
    const model = await DistributionModel.findOne({
      where: {
        id,
      },
      include: [
        UserModel,
        { model: DistributionBlockModel, include: [DistributionMessageModel] },
      ],
    });

    if (!model) throw new ModelNotFoundException(DistributionModel, id);

    return model;
  }

  public async removeOne(id: number): Promise<void> {
    const model = await this.getOne(id);

    await DistributionContactsModels.destroy({
      where: {
        distribution_id: id,
      },
    });

    await model.destroy();
  }

  public async update(
    id: number,
    company_id: number,
    data: DistributionCreateDto,
  ): Promise<DistributionModel> {
    await this.removeOne(id);
    return await this.create(company_id, data, id);
  }

  async removeBlock(id: number): Promise<void> {
    await DistributionBlockModel.destroy({
      where: {
        id,
      },
    });
  }

  async getGreetings(company_id: number) {
    return await DistributionModel.findOne({
      where: {
        company_id,
        greetings: true,
      },
      include: [
        UserModel,
        { model: DistributionBlockModel, include: [DistributionMessageModel] },
      ],
    });
  }

  async updateGreetings(
    distributionId: number,
    data: DistributionGreetingsUpdateDto,
  ) {
    const distributionModel = await this.getOne(distributionId);
    distributionModel.blocks.forEach((el) => el.destroy());
    await this.createBlocks(distributionModel, [data.block]);
  }

  async sendGreetings(botId: number, chatId: number) {
    const botModel = await BotModel.findOne({
      where: {
        id: botId,
      },
    });

    const chatBotModel = await ChatBotModel.findOne({
      where: {
        telegram_chat_id: chatId,
      },
      include: [
        {
          model: ChatModel,
          include: [{ model: UserModel, include: [ChatModel] }],
        },
      ],
    });
    const greetingsDistribution = await DistributionModel.findOne({
      where: {
        greetings: true,
        company_id: botModel.company_id,
      },
      include: [
        {
          model: UserModel,
          include: [{ model: ChatModel, include: [ChatBotModel] }],
        },
        { model: DistributionBlockModel, include: [DistributionMessageModel] },
      ],
    });
    console.log(chatBotModel.chat.user);
    console.log(greetingsDistribution);
    await this.sendDistribution(greetingsDistribution, [
      chatBotModel.chat.user,
    ]);
  }
}
