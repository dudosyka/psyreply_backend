import { Inject, Injectable } from "@nestjs/common";
import { CompanyModel } from "../models/company.model";
import { InjectModel } from "@nestjs/sequelize";
import { BlockProvider } from "../../block/providers/block.provider";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { BlockModel } from "../../block/models/block.model";
import { Sequelize } from "sequelize-typescript";
import { UserModel } from "../../user/models/user.model";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { ResultModel } from "../../result/models/result.model";
import { GroupModel } from "../models/group.model";
import { GroupCreateDto } from "../dtos/group-create.dto";
import { GroupUpdateDto } from "../dtos/group-update.dto";
import { Op } from "sequelize";
import { BaseProvider } from "../../base/base.provider";
import { CompanyStatDto } from "../dtos/company-stat.dto";
import { GroupBlockStatModel } from "../../result/models/group-block-stat.model";

@Injectable()
export class CompanyProvider extends BaseProvider<CompanyModel> {
  constructor(
    @InjectModel(CompanyModel) private companyModel: CompanyModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    private sequelize: Sequelize
  ) {
    super(CompanyModel)
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
    );

    await this.addBlocks(company.id, inputBlocks).catch(async (err) => {
      if (!isPropagate) await TransactionUtil.rollback();
      throw err;
    });

    if (!isPropagate) await TransactionUtil.commit();

    return company;
  }

  public async getOne(
    id: number,
    fullData: boolean = false,
  ): Promise<CompanyModel> {
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

  public getAll(): Promise<CompanyModel[]> {
    return super.getAll({
      include: [BlockModel, UserModel]
    })
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
    );

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
    const companyModel = CompanyModel.findOne({
      where: {
        id: companyId,
      },
    });

    if (!companyModel)
      throw new ModelNotFoundException(CompanyModel, companyId);

    return await GroupModel.findAll({
      where: {
        company_id: companyId,
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
    await UserModel.update(
      {
        group_id: null,
      },
      {
        where: {
          id: {
            [Op.in]: users,
          },
        },
      },
    );

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

    await userModel
      .update(
        {
          company_id: groupModel.company_id,
          group_id: groupModel.id,
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

  async getStat(companyId: number, groupId: number): Promise<CompanyStatDto> {
    const statModels = await GroupBlockStatModel.findAll({
      where: {
        company_id: companyId,
        group_id: groupId
      }
    });

    return statModels.reduce((r, a) => {
      r[a.week] = r[a.week] || []
      r[a.week].push(a);
      return r;
    }, Object.create(null))
  }

  async updateStat(statId: number, updateDto: { metric_id: number, value: number }[]): Promise<GroupBlockStatModel> {
    const model = await GroupBlockStatModel.findOne({
      where: {
        id: statId
      }
    });

    if (!model) throw new ModelNotFoundException(GroupBlockStatModel, statId);

    console.log(updateDto);

    await model.update({
      data: JSON.stringify(updateDto)
    });

    return model;
  }

  async removeStatRow(statId: number) {
    await GroupBlockStatModel.destroy({
      where: {
        id: statId
      }
    });
  }
}
