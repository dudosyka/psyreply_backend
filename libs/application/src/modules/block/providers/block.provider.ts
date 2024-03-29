import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BlockModel } from '../models/block.model';
import { BlockCreateDto } from '../dtos/block-create.dto';
import { TestBlockProvider } from '../../test-block/providers/test-block.provider';
import { TestBlockCreateDto } from '../../test-block/dtos/test-block-create.dto';
import { BlockFilterDto } from '../dtos/block-filter.dto';
import { BlockUpdateDto } from '../dtos/block-update.dto';
import { Sequelize } from 'sequelize-typescript';
import { TestModel } from '../../test/models/test.model';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { TransactionUtil } from '../../../utils/TransactionUtil';
import { ResultModel } from '../../result/models/result.model';
import { CompanyModel } from '../../company/models/company.model';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { UserModel } from '../../user/models/user.model';
import { QuestionModel } from '../../question/models/question.model';
import { BaseProvider } from '../../base/base.provider';
import { BlockGroupStatOutputDto } from '../../result/dto/block-stat-output.dto';
import { GroupModel } from '../../company/models/group.model';
import { GroupBlockStatModel } from '../../result/models/group-block-stat.model';
import { UrlGeneratorUtil } from '@app/application/utils/url-generator.util';

@Injectable()
export class BlockProvider extends BaseProvider<BlockModel> {
  constructor(
    @InjectModel(BlockModel) private blockModel: BlockModel,
    @Inject(TestBlockProvider) private testBlockProvider: TestBlockProvider,
    @Inject(AuthProvider) private authProvider: AuthProvider,
    private sequelize: Sequelize,
  ) {
    super(BlockModel);
  }

  async getAll(filter: BlockFilterDto): Promise<BlockModel[]> {
    const { exclude_test, ...filters } = filter;
    if (filter.exclude_test) {
      return await BlockModel.findAll({
        where: {
          ...filters,
        },
        include: [TestModel, CompanyModel],
      }).then((el) => {
        return el.filter((block) => {
          const tests = block.tests.map((el) => el.id);
          return !tests.includes(exclude_test);
        });
      });
    }

    return super.getAll({
      where: {
        ...filters,
      },
      include: [TestModel, CompanyModel],
    });
  }

  async getOne(
    blockId: number,
    rawData = false,
    requesterCompany: number = null,
  ): Promise<BlockModel> {
    const where: any = {
      id: blockId,
    };
    const model = await super.getOne({
      where,
      include: rawData ? [] : [{ model: TestModel, include: [QuestionModel] }],
    });

    if (model.company_id != requesterCompany && requesterCompany)
      throw new ForbiddenException();

    return model;
  }

  async createModel(createDto: BlockCreateDto): Promise<BlockModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const { tests, ...data } = createDto;

    const block = await BlockModel.create(
      {
        ...data,
      },
      TransactionUtil.getHost(),
    )
      .catch((err) => {
        throw err;
      })
      .then((block) => {
        if (!block) {
          TransactionUtil.rollback();
          throw new Error('Block creation failed!');
        }
        return block;
      });

    await this.appendTests(block.id, createDto.tests).catch((err) => {
      throw err;
    });

    if (!isPropagate) {
      await TransactionUtil.commit();
    }

    return block;
  }

  async remove(
    blocks: number[],
    requesterCompany: number = null,
  ): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    await this.testBlockProvider.removeAllRelations(0, blocks);

    return await Promise.all(
      blocks.map(async (id) => {
        const where: any = {
          id,
        };

        const block = await BlockModel.findOne({
          where,
        });

        if (!block) throw new ModelNotFoundException(BlockModel, id);

        if (block.company_id != requesterCompany && requesterCompany)
          throw new ForbiddenException();

        await ResultModel.update(
          {
            block_title: block.name,
          },
          {
            where: {
              block_id: id,
            },
            ...TransactionUtil.getHost(),
          },
        );

        await BlockModel.destroy({
          where: {
            id,
          },
          ...TransactionUtil.getHost(),
        });
      }),
    )
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
        return true;
      })
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      });
  }

  async update(
    blockId: number,
    updateDto: BlockUpdateDto,
    requesterCompany: number | null,
  ): Promise<BlockModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const block = await BlockModel.findOne({
      where: {
        id: blockId,
      },
    });
    if (!block) {
      if (!isPropagate) await TransactionUtil.rollback();
      throw new ModelNotFoundException(BlockModel, blockId);
    }

    if (block.company_id != requesterCompany && requesterCompany)
      throw new ForbiddenException();

    await block.update(
      {
        ...updateDto,
      },
      {
        ...TransactionUtil.getHost(),
      },
    );

    await ResultModel.update(
      {
        block_title: block.name,
      },
      {
        where: {
          block_id: blockId,
        },
        ...TransactionUtil.getHost(),
      },
    ).then(() => {
      if (!isPropagate) TransactionUtil.commit();
    });

    return block;
  }

  async excludeTestFromAll(testId: number): Promise<boolean> {
    return await this.testBlockProvider.removeAllRelations(testId);
  }

  async includes(blockId: number): Promise<TestModel[]> {
    const blocks = await this.getAll({
      id: blockId,
    });
    const ids = [];
    const tests: TestModel[] = [];
    blocks.forEach((el) => {
      el.tests.forEach((test) => {
        if (!ids.includes(test.id)) tests.push(test);
      });
    });
    return tests;
  }

  async excludeTest(testId: number, blockId: number): Promise<boolean> {
    return await this.testBlockProvider.exclude(testId, blockId);
  }

  async appendTests(blockId: number, tests: number[]): Promise<boolean> {
    const relation = await this.testBlockProvider.getTests(blockId);
    tests = tests.filter((el) => {
      if (relation.includes(el)) throw new HttpException('Double record', 409);
      else return true;
    });
    const testsModels = await TestModel.findAll({
      where: {
        id: tests,
      },
    });
    return !!(await this.testBlockProvider.create(
      this.createTestBlockDto(blockId, testsModels),
    ));
  }

  async copyToCompany(
    blocks: number[],
    companyId: any,
  ): Promise<BlockModel[]> | never {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return await Promise.all(
      blocks.map(async (blockId: number) => {
        const block = await this.getOne(blockId, true);
        if (!block) throw new ModelNotFoundException(BlockModel, blockId);

        return await this.createModel({
          name: block.name,
          company_id: companyId,
          description: block.description,
          time: block.time,
          tests: await this.testBlockProvider.getTests(blockId),
        })
          .catch((err) => {
            throw err;
          })
          .then((data) => data);
      }),
    )
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      })
      .then(async (data) => {
        if (!isPropagate) await TransactionUtil.commit();
        return await this.getAll({ id: data.map((el) => el.id) });
      });
  }

  async createBlockHash(
    blockId: number,
    week: number,
    requesterCompany: number | null = null,
  ) {
    const blockModel = await BlockModel.findOne({
      where: {
        id: blockId,
      },
    });

    if (!blockModel) throw new ModelNotFoundException(BlockModel, blockId);

    if (blockModel.company_id != requesterCompany && requesterCompany)
      throw new ForbiddenException();

    return this.authProvider.createBlockToken(blockModel, week);
  }

  async createLinks(
    {
      blockId,
      week,
      companyId,
    }: { blockId: number; week: number | null; companyId: number },
    jetBotId: number,
  ): Promise<{ link: string; linkdb: string }> {
    const blockModel = await BlockModel.findOne({
      where: {
        id: blockId,
      },
    });

    let userModel = await UserModel.findOne({
      where: {
        jetBotId,
      },
    });

    if (!userModel) {
      userModel = await this.authProvider.createUser(jetBotId, companyId);
    }

    if (!blockModel) {
      throw new ModelNotFoundException(BlockModel, blockId);
    }

    let weekForLink = week;

    if (week == null) {
      weekForLink = weekForLink
        ? weekForLink
        : blockModel.week
        ? blockModel.week + 1
        : 1;

      blockModel.week = weekForLink;

      await blockModel.save();
    }

    const link = await this.authProvider.createUserBlockToken(
      userModel,
      weekForLink,
      blockModel,
    );

    const linkdb = await this.authProvider.assignUserByUserBlock(userModel.id);

    const clientUrl = UrlGeneratorUtil.generateClientEndpoint();

    return {
      link: `${clientUrl}test/${link}`,
      linkdb: `${clientUrl}results/${linkdb}`,
    };
  }

  //Sub method which auto-generates week and use UserModel instead of jetBotId
  async createLinkForDistribution(blockId, userModel) {
    const blockModel = await BlockModel.findOne({
      where: {
        id: blockId,
      },
    });

    if (!blockModel) throw new ModelNotFoundException(BlockModel, blockId);

    let week = blockModel.week;

    if (week == null) {
      week = 1;
    } else week++;

    blockModel.week = week;

    await blockModel.save();

    const link = await this.authProvider.createUserBlockToken(
      userModel,
      week,
      blockModel,
    );

    const linkdb = await this.authProvider.assignUserByUserBlock(userModel.id);

    const clientUrl = UrlGeneratorUtil.generateClientEndpoint();

    console.log(clientUrl);

    return {
      link: `${clientUrl}test/${link}`,
      linkdb: `${clientUrl}results/${linkdb}`,
    };
  }

  private createTestBlockDto(
    blockId: number,
    tests: TestModel[],
  ): TestBlockCreateDto[] {
    return tests.map((el) => {
      return {
        block_id: blockId,
        test_id: el.id,
        count: el.type_id < 6,
      };
    });
  }

  async saveStat(
    blockId: number,
    week: number,
    requesterCompany: number | null = null,
    groupId = 0,
    resultIds: number[] = [],
  ): Promise<BlockGroupStatOutputDto[]> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const blockModel = await super.getOne({
      where: {
        id: blockId,
      },
      include: [
        {
          model: CompanyModel,
          include: [
            {
              model: GroupModel,
              ...(groupId == 0 ? {} : { where: { id: groupId } }),
            },
          ],
        },
      ],
    });

    if (!blockModel.company)
      throw new BadRequestException('Block must be in company');

    if (blockModel.company_id != requesterCompany && requesterCompany)
      throw new ForbiddenException();

    const companyModel = blockModel.company;
    const groups = companyModel.groups;

    const groupsByIds: { [key: string]: GroupModel } = groups.reduce((r, a) => {
      r[a.id] = r[a.id] || [];
      r[a.id].push(a);
      return r;
    }, Object.create(null));

    const userIdsByGroup = (
      await GroupModel.findAll({
        where: {
          id: groups.map((el) => el.id),
        },
        include: [UserModel],
      })
    )
      .filter((el) => el.users.length)
      .reduce((r, a) => {
        r[a.id] = r[a.id] || [];
        r[a.id] = a.users.map((el) => el.id);
        return r;
      }, Object.create(null));

    const resultQuery: {
      block_id: number;
      week: number;
      company_id: number;
      approved: boolean;
      id?: number[];
    } = {
      block_id: blockId,
      week,
      company_id: blockModel.company_id,
      approved: true,
    };

    if (resultIds.length) resultQuery.id = resultIds;

    console.log(resultQuery);

    const results = await ResultModel.findAll({
      where: {
        ...resultQuery,
      },
      include: [UserModel],
    });

    const resultsByUserId: { [key: string]: ResultModel[] } = results.reduce(
      (r, a) => {
        r[a.user_id] = r[a.user_id] || [];
        r[a.user_id].push(a);
        return r;
      },
      Object.create(null),
    );

    const companyMaxAmountOfUsers = (
      await UserModel.findAll({
        where: {
          company_id: companyModel.id,
        },
      })
    ).length;
    let companyRealAmountOfUsers = 0;
    let companyMetrics = {};
    const result = await Promise.all(
      Object.keys(userIdsByGroup).map(async (el) => {
        const groupId = parseInt(el);
        const userIds = userIdsByGroup[el];
        const maxAmountOfUsers = userIds.length;
        let realAmountOfUsers = 0;
        let metrics = {};
        userIds.forEach((userId) => {
          if (resultsByUserId[userId]) {
            realAmountOfUsers++;
            companyRealAmountOfUsers++;
            const result = resultsByUserId[userId][0];
            const data = JSON.parse(result.data);
            data.forEach((el) => {
              if (metrics[el.metric_id])
                metrics[el.metric_id] += parseInt(el.value);
              else metrics[el.metric_id] = parseInt(el.value);
              if (companyMetrics[el.metric_id])
                companyMetrics[el.metric_id] += parseInt(el.value);
              else companyMetrics[el.metric_id] = parseInt(el.value);
            });
          }
        });

        metrics = Object.keys(metrics).map((id) => {
          const value = Math.round(metrics[id] / realAmountOfUsers);
          return {
            metric_id: id,
            value,
          };
        });

        const percent = Math.round(
          (realAmountOfUsers / maxAmountOfUsers) * 100,
        );
        const group_result = metrics;
        const group = groupsByIds[groupId];

        const groupStatModel = await GroupBlockStatModel.findOne({
          where: {
            week,
            company_id: companyModel.id,
            group_id: groupId,
            block_id: blockModel.id,
          },
        });

        if (!groupStatModel) {
          await GroupBlockStatModel.create(
            {
              data: JSON.stringify(group_result),
              percent,
              week,
              company_id: companyModel.id,
              group_id: groupId,
              block_id: blockModel.id,
            },
            TransactionUtil.getHost(),
          ).catch((err) => {
            if (!isPropagate) TransactionUtil.rollback();
            throw err;
          });
        } else {
          await groupStatModel
            .update({
              data: JSON.stringify(group_result),
              percent,
            })
            .catch((err) => {
              if (!isPropagate) TransactionUtil.rollback();
              throw err;
            });
        }

        return {
          group,
          group_result,
          percent,
        };
      }),
    )
      .catch((err) => {
        throw err;
      })
      .then((data) => {
        if (!isPropagate) TransactionUtil.commit();
        return data;
      });

    companyMetrics = Object.keys(companyMetrics).map((id) => {
      const value = Math.round(companyMetrics[id] / companyRealAmountOfUsers);
      return {
        metric_id: id,
        value,
      };
    });

    const percent = Math.round(
      (companyRealAmountOfUsers / companyMaxAmountOfUsers) * 100,
    );

    const companyGroupStatModel = await GroupBlockStatModel.findOne({
      where: {
        week,
        company_id: companyModel.id,
        group_id: null,
        block_id: blockModel.id,
      },
    });

    if (!companyGroupStatModel)
      await GroupBlockStatModel.create({
        week,
        company_id: companyModel.id,
        group_id: null,
        block_id: blockModel.id,
        percent,
        data: JSON.stringify(companyMetrics),
      });
    else
      companyGroupStatModel.update({
        percent,
        data: JSON.stringify(companyMetrics),
      });

    return result;
  }

  async checkStatExists(
    blockId: number,
    week: number,
  ): Promise<GroupBlockStatModel[]> {
    await super.getOne({
      where: {
        id: blockId,
      },
    });

    return await GroupBlockStatModel.findAll({
      where: {
        block_id: blockId,
        week,
      },
    });
  }
}
