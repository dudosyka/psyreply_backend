import { Inject, Injectable } from "@nestjs/common";
import { CompanyModel } from "../models/company.model";
import { InjectModel } from "@nestjs/sequelize";
import { BlockProvider } from "../../block/providers/block.provider";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { BlockModel } from "../../block/models/block.model";
import { Sequelize } from "sequelize-typescript";
import { UserModel } from "../../user/models/user.model";
import { CompanyUserModel } from "../models/company-user.model";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { ResultModel } from "../../result/models/result.model";

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

  public async getOne(id: number): Promise<CompanyModel> {
    const company = await CompanyModel.findOne({
      where: {
        id
      },
      include: [BlockModel]
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
    });

    if (!isPropagate)
      await TransactionUtil.commit();

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

  public async appendUser(userId: number, companyId: number): Promise<boolean> {
    return !!(await CompanyUserModel.update({
      company_id: companyId
    }, {
      where: {
        user_id: userId
      }
    }));
  }

  private async addBlocks(id: number, blocks: number[]) {
    if (blocks.length > 0) {
      return !!(await this.blockProvider.copyToCompany(blocks, id).catch(err => {
        throw err;
      }));
    }
  }
}
