import { Inject, Injectable } from "@nestjs/common";
import { CompanyModel } from "../models/company.model";
import { InjectModel } from "@nestjs/sequelize";
import { BlockProvider } from "../../block/providers/block.provider";
import { CompanyCreateDto } from "../dtos/company-create.dto";
import { CompanyUpdateDto } from "../dtos/company-update.dto";
import { BlockModel } from "../../block/models/block.model";

@Injectable()
export class CompanyProvider {
  constructor(
    @InjectModel(CompanyModel) private companyModel: CompanyModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider
  ) {}

  private async addBlocks(id: number, blocks: number[]) {
    if (blocks.length > 0) {
      return !!(await Promise.all(blocks.map(async el => {
        await this.blockProvider.copyToCompany(el, id);
      })));
    }
  }

  public async create(createDto: CompanyCreateDto, inputBlocks: number[] = []): Promise<CompanyModel> {
    const company = await CompanyModel.create({
      ...createDto
    })
    await this.addBlocks(company.id, inputBlocks);
    return company;
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
      include: [BlockModel]
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
}
