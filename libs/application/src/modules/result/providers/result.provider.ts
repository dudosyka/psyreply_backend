import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { TestProvider } from '../../test/providers/test.provider';
import { BlockProvider } from '../../block/providers/block.provider';
import { Sequelize } from 'sequelize-typescript';
import { ResultCreateDto } from '../dto/result-create.dto';
import { ResultModel } from '../models/result.model';
import { TestResultDto } from '../../test/dtos/test-result.dto';
import { ResultFitlerDto } from '../dto/result-fitler.dto';
import { ResultUpdateDto } from '../dto/result-update.dto';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { CompanyProvider } from '../../company/providers/company.provider';
import { BlockModel } from '../../block/models/block.model';
import { CompanyModel } from '../../company/models/company.model';
import { ResultClientOutputDto } from '../dto/result-client-output.dto';
import { MetricModel } from '../../metric/models/metric.model';
import { GroupModel } from '../../company/models/group.model';
import { UserModel } from '../../user/models/user.model';
import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { BaseProvider } from '../../base/base.provider';
import { ChatGateway } from '@app/application/modules/chat/providers/chat.gateway';
import { BotProvider } from '@app/application/modules/bot/providers/bot.provider';
import { ClientNewMessageDto } from '@app/application/modules/chat/dto/client-new-message.dto';
import { UserProvider } from '@app/application/modules/user/providers/user.provider';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';

@Injectable()
export class ResultProvider extends BaseProvider<ResultModel> {
  constructor(
    @Inject(TestProvider) private testProvider: TestProvider,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
    @Inject(ChatGateway) private chatGateway: ChatGateway,
    @Inject(BotProvider) private botProvider: BotProvider,
    @Inject(UserProvider) private userProvider: UserProvider,
    private sequelize: Sequelize,
  ) {
    super(ResultModel);
  }

  private async checkApproved(
    block: BlockModel,
    resultData: ResultCreateDto,
  ): Promise<boolean> {
    if (!block) return false;
    return resultData.time_on_pass <= block.time;
  }

  public async pass(
    userId: number,
    blockId: number,
    week: number,
    passDto: ResultCreateDto,
  ): Promise<ResultModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const data: TestResultDto[] = [];

    await Promise.all(
      passDto.tests.map(async (test) => {
        const res = await this.testProvider.pass(test, blockId).catch((err) => {
          if (!isPropagate) TransactionUtil.rollback();
          throw err;
        });
        if (res) data.push(res);
      }),
    );
    const blockModel = await this.blockProvider
      .getOne(blockId, true)
      .then((res) => res)
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      });
    let block_title = '';
    let company_title = '';
    if (blockModel) {
      block_title = blockModel.name;
      const companyModel = await this.companyProvider.getOne(
        blockModel.company_id,
      );
      company_title = companyModel.name;
    }

    const dataMetrics = {};
    data.forEach((el) => {
      if (dataMetrics[el.metric_id]) {
        dataMetrics[el.metric_id].push(el.value);
      } else {
        dataMetrics[el.metric_id] = [el.value];
      }
    });
    const newData = [];
    Object.keys(dataMetrics).forEach((el) => {
      let sum = 0;
      dataMetrics[el].forEach((el) => {
        sum += parseInt(el);
      });
      newData.push({
        metric_id: parseInt(el),
        value: sum,
      });
    });

    const resultData = {
      user_id: userId,
      block_id: blockId,
      block_title,
      company_title,
      week,
      time_on_pass: passDto.time_on_pass,
      approved: await this.checkApproved(
        blockModel ? blockModel : null,
        passDto,
      ),
      data: JSON.stringify(newData),
      company_id: blockModel ? blockModel.company_id : null,
    };

    const chatModel = await ChatModel.findOne({
      where: {
        company_id: blockModel.company_id,
      },
      include: [ChatBotModel],
    });

    if (chatModel) {
      const newMessageDto: ClientNewMessageDto = {
        msg: {
          type_id: 1,
          text: 'Тестирование пройдено!',
          attachments: [],
        },
        chatId: chatModel.bot_chat.telegram_chat_id,
        chatModelId: chatModel.id,
      };

      const messageOutputDto = await this.botProvider.newMessageInside(
        newMessageDto,
      );

      await this.chatGateway.sendTo(
        chatModel.bot_chat.telegram_chat_id.toString(),
        messageOutputDto,
      );
    }

    return await ResultModel.create(resultData, TransactionUtil.getHost())
      .then((res) => {
        if (res) {
          if (!isPropagate) TransactionUtil.commit();
          return res;
        } else {
          if (!isPropagate) TransactionUtil.rollback();
          throw new Error('Result model creation failed');
        }
      })
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      });
  }

  public async getResults(filterDto: ResultFitlerDto): Promise<ResultModel[]> {
    const { createdAt, ...filter } = filterDto.filters;
    const { group_id, ...filters } = filter;
    const results = await ResultModel.findAll({
      where: {
        ...filters,
      },
      order: [['id', 'DESC']],
      include: [
        BlockModel,
        CompanyModel,
        {
          model: UserModel,
          required: true,
          include: [
            {
              model: GroupModel,
              ...(group_id ? { where: { id: group_id } } : {}),
            },
          ],
        },
      ],
    });
    if (createdAt) {
      return results.filter((el) => {
        const date = `${el.createdAt.getFullYear()}-${
          el.createdAt.getMonth() + 1
        }-${el.createdAt.getDate()}`;
        return date == createdAt;
      });
    } else {
      return results;
    }
  }

  private async resultsByMetrics(
    models: ResultModel[],
    parted = false,
  ): Promise<ResultClientOutputDto> {
    const result = {
      metrics: {},
      part: parted,
    };

    await Promise.all(
      models.map(async (el) => {
        const data = JSON.parse(el.data);
        await Promise.all(
          data.map(async (metric) => {
            const metricModel = await MetricModel.findOne({
              where: {
                id: metric['metric_id'],
              },
            });
            if (metricModel) {
              if (result.metrics[metricModel.id]) {
                result.metrics[metricModel.id].values.push(metric.value);
              } else {
                result.metrics[metricModel.id] = {
                  name: metricModel.name,
                  values: [metric.value],
                };
              }
            }
          }),
        );
      }),
    );

    return result;
  }

  public async getResultsClient(
    userId: number,
    last = false,
  ): Promise<ResultClientOutputDto> {
    const models = await this.getResults({ filters: { user_id: userId } });
    if (last) {
      return await this.resultsByMetrics([models[0]], last);
    }
    const modelsReversed = [...models].reverse();
    return await this.resultsByMetrics(modelsReversed, last);
  }

  public async update(
    resultId: number,
    updateDto: ResultUpdateDto,
    requesterCompany: number | null = null,
  ): Promise<ResultModel> {
    const resModel = await ResultModel.findOne({
      where: {
        id: resultId,
      },
    });

    if (!resModel) throw new ModelNotFoundException(ResultModel, resultId);

    if (resModel.company_id != requesterCompany && requesterCompany)
      throw new ForbiddenException();

    if (updateDto.newData) resModel.data = JSON.stringify(updateDto.newData);
    if (updateDto.approved != null) resModel.approved = updateDto.approved;
    await resModel.save();
    return resModel;
  }
}
