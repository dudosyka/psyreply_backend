import { Inject, Injectable } from "@nestjs/common";
import { CompanyModel } from "../models/company.model";
import { InjectModel } from "@nestjs/sequelize";
import { BlockProvider } from "../../block/providers/block.provider";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { BlockModel } from "../../block/models/block.model";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";
import { UserModel } from "../../user/models/user.model";
import { CompanyUserModel } from "../models/company-user.model";

@Injectable()
export class CompanyProvider {
  constructor(
    @InjectModel(CompanyModel) private companyModel: CompanyModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    private sequelize: Sequelize
  ) {}

  private async addBlocks(id: number, blocks: number[], transaction: {transaction: Transaction} = {transaction: null}) {
    if (blocks.length > 0) {
      return !!(await this.blockProvider.copyToCompany(blocks, id, transaction).catch(err => {
        throw new Error(err)
      }));
    }
  }

  public async create(createDto: CompanyCreateDto, inputBlocks: number[] = []): Promise<CompanyModel> {
    return new Promise<CompanyModel>((resolve, reject) => {
      this.sequelize.transaction(async t => {
        const host = { transaction: t }
        const company = await CompanyModel.create({
          ...createDto
        }, host);
        await this.addBlocks(company.id, inputBlocks, host).then(() => resolve(company)).catch(err => {
          host.transaction.rollback()
          reject(err);
        });
      }).catch(err => reject(err));
    })
  }

  public getOne(id: number): Promise<CompanyModel> {
    return CompanyModel.findOne({
      where: {
        id
      }
    });
  }

  public getAll(): Promise<CompanyModel[]> {
    return CompanyModel.findAll({
      include: [BlockModel, UserModel]
    })
  }

  public async update(id: number, updateDto: CompanyUpdateDto): Promise<boolean> {
    return !!(await CompanyModel.update({
      ...updateDto
    }, {
      where: {
        id
      }
    }));
  }

  public async remove(id: number, removeBlocks: boolean = true): Promise<boolean> {
    await this.blockProvider.onCompanyRemove(id, removeBlocks)
    return (await CompanyModel.destroy({
      where: {
        id
      }
    })) > 0;
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
}
