import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CompanyModel } from '../models/company.model';
import { InjectModel } from '@nestjs/sequelize';
import { BlockProvider } from '../../block/providers/block.provider';
import { CompanyCreateDto } from '../dtos/company-create.dto';
import { CompanyUpdateDto } from '../dtos/company-update.dto';
import { BlockModel } from '../../block/models/block.model';
import { Sequelize } from 'sequelize-typescript';
import { UserModel } from '../../user/models/user.model';
import { TransactionUtil } from '../../../utils/TransactionUtil';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { ResultModel } from '../../result/models/result.model';
import { GroupModel } from '../models/group.model';
import { GroupCreateDto } from '../dtos/group-create.dto';
import { GroupUpdateDto } from '../dtos/group-update.dto';
import { BaseProvider } from '../../base/base.provider';
import { CompanyStatDto } from '../dtos/company-stat.dto';
import { GroupBlockStatModel } from '../../result/models/group-block-stat.model';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { BotModel } from '@app/application/modules/bot/models/bot.model';
import { UserGroupModel } from '@app/application/modules/company/models/user-group.model';

@Injectable()
export class CompanyProvider extends BaseProvider<CompanyModel> {
  constructor(
    @InjectModel(CompanyModel) private companyModel: CompanyModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(AuthProvider) private authProvider: AuthProvider,
    private sequelize: Sequelize,
  ) {
    super(CompanyModel);
  }

  public async create(
    createDto: CompanyCreateDto,
    inputBlocks: number[] = [],
  ): Promise<CompanyModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const company = await CompanyModel.create(
      {
        ...createDto,
      },
      TransactionUtil.getHost(),
    ).then((res) => {
      if (!res) {
        if (!isPropagate) TransactionUtil.rollback();
        throw new Error('Company creation failed');
      }
      return res;
    });

    await this.addBlocks(company.id, inputBlocks).catch(async (err) => {
      if (!isPropagate) await TransactionUtil.rollback();
      throw err;
    });

    if (!isPropagate) await TransactionUtil.commit();

    return company;
  }

  public async getOne(id: number, fullData = false): Promise<CompanyModel> {
    let include: any = [BlockModel];
    if (fullData) {
      include = [BlockModel, { model: GroupModel, include: [UserModel] }];
    }

    return super.getOne({
      where: {
        id,
      },
      include,
    });
  }

  public async getOneSimple(id: number) {
    return await super.getOne({
      where: {
        id,
      },
    });
  }

  public getAll(): Promise<CompanyModel[]> {
    return super.getAll({
      include: [],
    });
  }

  public async update(
    id: number,
    updateDto: CompanyUpdateDto,
  ): Promise<CompanyModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const company = await CompanyModel.findOne({
      where: {
        id,
      },
    });

    if (!company) {
      if (!isPropagate) await TransactionUtil.rollback();
      throw new ModelNotFoundException(CompanyModel, id);
    }

    await company.update({
      ...updateDto,
    });

    await ResultModel.update(
      {
        company_title: company.name,
      },
      {
        where: {
          company_id: id,
        },
        ...TransactionUtil.getHost(),
      },
    ).then(() => {
      if (!isPropagate) TransactionUtil.commit();
    });

    return company;
  }

  public async remove(id: number): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const company = await this.getOne(id);

    if (!company) {
      if (!isPropagate) await TransactionUtil.rollback();
      throw new ModelNotFoundException(CompanyModel, id);
    }

    await ResultModel.update(
      {
        company_title: company.name,
      },
      {
        where: {
          company_id: company.id,
        },
        ...TransactionUtil.getHost(),
      },
    );

    await this.blockProvider.remove(
      company.blocks ? company.blocks.map((el) => el.id) : [],
    );

    return await company
      .destroy({
        ...TransactionUtil.getHost(),
      })
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      })
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
        return true;
      });
  }

  public async appendBlocks(id: number, blocks: number[]): Promise<boolean> {
    const company = await this.getOne(id);
    if (company) return await this.addBlocks(id, blocks);
    else return false;
  }

  private async addBlocks(id: number, blocks: number[]) {
    if (blocks.length > 0) {
      return !!(await this.blockProvider
        .copyToCompany(blocks, id)
        .catch((err) => {
          throw err;
        }));
    }
  }

  private async appendUsersArray(group: GroupModel, users: number[]) {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return await Promise.all(
      users.map(async (el) => {
        await this.appendUser(null, el, group).catch((err) => {
          throw err;
        });
      }),
    )
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      })
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
      });
  }

  public async createGroup(
    createDto: GroupCreateDto,
  ): Promise<GroupModel> | never {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }
    const companyModel = await CompanyModel.findOne({
      where: {
        id: createDto.company_id,
      },
    });

    if (!companyModel)
      throw new ModelNotFoundException(CompanyModel, createDto.company_id);

    const group = await GroupModel.create(
      {
        name: createDto.name,
        company_id: createDto.company_id,
      },
      TransactionUtil.getHost(),
    ).then((res) => {
      if (!res) {
        if (!isPropagate) TransactionUtil.rollback();
        throw new Error('Group creation failed');
      }
      return res;
    });

    await this.appendUsersArray(group, createDto.users)
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
      })
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();

        throw err;
      });

    return group;
  }

  async getGroups(companyId: number): Promise<GroupModel[]> | never {
    const companyModel = await super.getOne({
      where: {
        id: companyId,
      },
    });

    return await GroupModel.findAll({
      where: {
        company_id: companyModel.id,
      },
      include: [CompanyModel, UserModel],
    });
  }

  async getGroup(groupId: number): Promise<GroupModel> | never {
    const model = await GroupModel.findOne({
      where: {
        id: groupId,
      },
      include: [CompanyModel, UserModel],
    });
    if (!model) throw new ModelNotFoundException(GroupModel, groupId);
    return model;
  }

  async removeGroup(groupId: number): Promise<boolean> | never {
    const model = await this.getGroup(groupId).catch((err) => {
      throw err;
    });

    await model.destroy();

    return true;
  }

  async updateGroup(updateDto: GroupUpdateDto): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const model = await this.getGroup(updateDto.id).catch((err) => {
      throw err;
    });

    if (!model) throw new ModelNotFoundException(GroupModel, updateDto.id);

    await model
      .update(
        {
          name: updateDto.name,
        },
        TransactionUtil.getHost(),
      )
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      });

    await this.appendUsersArray(model, updateDto.users)
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      })
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
      });

    return true;
  }

  async removeUsersFromGroup(users: number[]): Promise<boolean> {
    await UserGroupModel.destroy({
      where: {
        user_id: users,
      },
    });

    return true;
  }

  async appendUser(
    groupId: number,
    userId: number,
    group: GroupModel = null,
  ): Promise<boolean> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const userModel = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (!userModel) throw new ModelNotFoundException(UserModel, userId);

    const groupModel = group
      ? group
      : await GroupModel.findOne({
          where: {
            id: groupId,
          },
        });

    if (!groupModel) throw new ModelNotFoundException(GroupModel, groupId);

    await UserGroupModel.create(
      {
        user_id: userModel.id,
        group_id: groupModel.id,
      },
      TransactionUtil.getHost(),
    );

    await userModel
      .update(
        {
          company_id: groupModel.company_id,
        },
        TransactionUtil.getHost(),
      )
      .catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      })
      .then(() => {
        if (!isPropagate) TransactionUtil.commit();
      });

    return true;
  }

  async getAvailableGroups(
    companyId: number,
    sharedGroups: number[],
  ): Promise<GroupModel[]> {
    const company = await super.getOne({
      where: {
        id: companyId,
      },
      include: [GroupModel],
    });

    if (sharedGroups[0] == 0) return company.groups;

    return company.groups.filter((group) => {
      return sharedGroups.includes(group.id);
    });
  }

  private processStat(
    statModels: GroupBlockStatModel[],
    availableMetrics = [],
  ) {
    const metricsToWeek = {};
    statModels.forEach((el) => {
      const data: { metric_id: string; value: number }[] = JSON.parse(el.data);
      data.forEach((item) => {
        if (
          (availableMetrics.length &&
            availableMetrics.includes(parseInt(item.metric_id))) ||
          !availableMetrics.length
        )
          if (metricsToWeek[item.metric_id]) {
            metricsToWeek[item.metric_id].push({
              week: el.week,
              date: el.createdAt,
              value: item.value,
            });
          } else {
            metricsToWeek[item.metric_id] = [
              { week: el.week, value: item.value, date: el.createdAt },
            ];
          }
      });
    });
    return metricsToWeek;
  }

  async getStatAll(
    companyId: number,
    groupId: number,
    sharedGroups: number[],
  ): Promise<CompanyStatDto> {
    if (sharedGroups[0] !== 0 && !sharedGroups.includes(groupId))
      throw new ForbiddenException();

    const statModels = await GroupBlockStatModel.findAll({
      where: {
        company_id: companyId,
        group_id: groupId ? groupId : null,
      },
    });

    if (statModels.length <= 0) {
      throw new ModelNotFoundException(GroupBlockStatModel, null);
    }

    const metricsToWeek: any = this.processStat(statModels);

    const statsWeekly = statModels.reduce((r, a) => {
      r[a.week] = r[a.week] || [];
      r[a.week].push(a);
      return r;
    }, Object.create(null));

    return {
      metricsToWeek,
      statsWeekly,
    };
  }

  async getStatPart(
    companyId: number,
    groupId: number,
    sharedGroups: number[],
  ): Promise<CompanyStatDto> {
    if (sharedGroups[0] !== 0 && !sharedGroups.includes(groupId))
      throw new ForbiddenException();

    const statModels = await GroupBlockStatModel.findAll({
      where: {
        company_id: companyId,
        group_id: groupId ? groupId : null,
      },
    });

    if (statModels.length <= 0) {
      throw new ModelNotFoundException(GroupBlockStatModel, null);
    }

    const lastModel = await GroupBlockStatModel.findOne({
      where: {
        company_id: companyId,
        group_id: groupId ? groupId : null,
      },
      order: [['id', 'DESC']],
    });

    const metrics = JSON.parse(lastModel.data).map((el) =>
      parseInt(el.metric_id),
    );

    const metricsToWeek = this.processStat(statModels, metrics);

    const statsWeekly = statModels.reduce((r, a) => {
      r[a.week] = r[a.week] || [];
      r[a.week].push(a);
      return r;
    }, Object.create(null));

    return {
      metricsToWeek,
      statsWeekly,
    };
  }

  async updateStat(
    statId: number,
    updateDto: { metric_id: number; value: number }[],
  ): Promise<GroupBlockStatModel> {
    const model = await GroupBlockStatModel.findOne({
      where: {
        id: statId,
      },
    });

    if (!model) throw new ModelNotFoundException(GroupBlockStatModel, statId);

    console.log(updateDto);

    await model.update({
      data: JSON.stringify(updateDto),
    });

    return model;
  }

  async removeStatRow(statId: number) {
    await GroupBlockStatModel.destroy({
      where: {
        id: statId,
      },
    });
  }

  async shareStat(
    companyId,
    groups: number[],
    sharedGroups: number[],
  ): Promise<string> {
    //shareGroups[0] === 0 will mean that the user is admin of dashboard (not from a share link)
    if (sharedGroups[0] !== 0) throw new ForbiddenException();

    const company = await CompanyModel.findOne({
      where: {
        id: companyId,
      },
    });

    if (!company) throw new ModelNotFoundException(CompanyModel, companyId);

    const groupModels = await GroupModel.findAll({
      where: {
        id: groups,
      },
    });

    if (groups.length != groupModels.length)
      throw new ModelNotFoundException(GroupModel, null);

    return this.authProvider.createShareDashboardToken(groups, companyId);
  }

  async getBots(id: number): Promise<BotModel[]> {
    return await BotModel.findAll({
      where: {
        company_id: id,
      },
    });
  }
}
