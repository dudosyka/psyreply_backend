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

@Injectable()
export class CompanyProvider {
  constructor(
    @InjectModel(CompanyModel) private companyModel: CompanyModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    private sequelize: Sequelize
  ) {
  }

  public async create(createDto: CompanyCreateDto, inputBlocks: number[] = []): Promise<CompanyModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const company = await CompanyModel.create({
      ...createDto
    }, TransactionUtil.getHost());

    await this.addBlocks(company.id, inputBlocks).catch(async err => {
      if (!isPropagate)
        await TransactionUtil.rollback();
      throw err;
    });

    if (!isPropagate)
      await TransactionUtil.commit();

    return company;
  }

  public async getOne(id: number, fullData: boolean = false): Promise<CompanyModel> {
    let include: any = [BlockModel];
    if (fullData) {
       include = [BlockModel, { model: GroupModel, include: [UserModel] }]
    }
    const company = await CompanyModel.findOne({
      where: {
        id
      },
      include
    });
    if (!company)
      throw new ModelNotFoundException(CompanyModel, id);
    return company;
  }

  public getAll(): Promise<CompanyModel[]> {
    return CompanyModel.findAll({
      include: [BlockModel, UserModel]
    });
  }

  public async update(id: number, updateDto: CompanyUpdateDto): Promise<CompanyModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const company = await CompanyModel.findOne({
      where: {
        id
      }
    });

    if (!company) {
      if (!isPropagate)
        await TransactionUtil.rollback();
      throw new ModelNotFoundException(CompanyModel, id);
    }

    await company.update({
      ...updateDto
    });

    await ResultModel.update({
      company_title: company.name
    }, {
      where: {
        company_id: id
      },
      ...TransactionUtil.getHost()
    }).then(() => {
      if (!isPropagate)
        TransactionUtil.commit();
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
      if (!isPropagate)
        await TransactionUtil.rollback();
      throw new ModelNotFoundException(CompanyModel, id);
    }

    await ResultModel.update({
      company_title: company.name
    }, {
      where: {
        company_id: company.id
      },
      ...TransactionUtil.getHost()
    });

    await this.blockProvider.remove(company.blocks ? company.blocks.map(el => el.id) : []);

    return await company.destroy({
      ...TransactionUtil.getHost()
    }).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    }).then(() => {
      if (!isPropagate)
        TransactionUtil.commit();
      return true;
    });
  }

  public async appendBlocks(id: number, blocks: number[]): Promise<boolean> {
    const company = await this.getOne(id);
    if (company)
      return await this.addBlocks(id, blocks);
    else
      return false;
  }

  private async addBlocks(id: number, blocks: number[]) {
    if (blocks.length > 0) {
      return !!(await this.blockProvider.copyToCompany(blocks, id).catch(err => {
        throw err;
      }));
    }
  }

  public async createGroup(createDto: GroupCreateDto): Promise<GroupModel> | never {
    const companyModel = CompanyModel.findOne({
      where: {
        id: createDto.company_id
      }
    });

    if (!companyModel)
      throw new ModelNotFoundException(CompanyModel, createDto.company_id);

    return await GroupModel.create({
      ...createDto
    });
  }

  async getGroups(companyId: number): Promise<GroupModel[]> | never {
    const companyModel = CompanyModel.findOne({
      where: {
        id: companyId
      }
    });

    if (!companyModel)
      throw new ModelNotFoundException(CompanyModel, companyId);

    return await GroupModel.findAll({
      where: {
        company_id: companyId
      },
      include: [CompanyModel, UserModel]
    });
  }

  async getGroup(groupId: number): Promise<GroupModel> | never {
    const model = await GroupModel.findOne({
      where: {
        id: groupId
      },
      include: [CompanyModel, UserModel]
    });
    if (!model)
      throw new ModelNotFoundException(GroupModel, groupId);
    return model;
  }

  async removeGroup(groupId: number): Promise<boolean> | never {
    const model = await this.getGroup(groupId).catch(err => {
      throw err;
    })

    await model.destroy()

    return true;
  }

  async updateGroup(updateDto: GroupUpdateDto): Promise<boolean> {
    const model = await this.getGroup(updateDto.id).catch(err => {
      throw err;
    })

    if (!model)
      throw new ModelNotFoundException(GroupModel, updateDto.id);

    await model.update({
      ...updateDto
    }).catch(err => {
      throw err;
    });

    return true;
  }

  async appendUser(groupId: number, userId: number): Promise<boolean> {
    const userModel = await UserModel.findOne({
      where: {
        id: userId
      }
    });

    if (!userModel)
      throw new ModelNotFoundException(UserModel, userId);

    const groupModel = await GroupModel.findOne({
      where: {
        id: groupId
      }
    });

    if (!groupModel)
      throw new ModelNotFoundException(GroupModel, groupId);

    await userModel.update({
      company_id: groupModel.company_id,
      group_id: groupModel.id
    });

    return true;
  }
}
