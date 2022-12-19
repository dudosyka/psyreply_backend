import { Inject, Injectable } from "@nestjs/common";
import { CompanyProvider } from "../../company/providers/company.provider";
import { UserModel } from "../models/user.model";
import { UserFilterDto } from "../dtos/user-filter.dto";
import { Op } from "sequelize";
import { CompanyModel } from "../../company/models/company.model";
import { GroupModel } from "../../company/models/group.model";

@Injectable()
export class UserProvider {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider
  ) {
  }

  public async moveToCompany(userId: number, companyId: number): Promise<boolean> {
    return await this.companyProvider.appendUser(userId, companyId);
  }

  public async getAll({ filters }: UserFilterDto): Promise<UserModel[]> {
    const { except_company_id, ...filter } = filters;
    let where = {
      ...filter
    };
    if (filters.except_company_id) {
      where = {
        company_id: {
          [Op.not]: filters.except_company_id
        },
        ...filter
      }
    }

    return UserModel.findAll({
      where,
      include: [CompanyModel, GroupModel]
    });
  }
}
