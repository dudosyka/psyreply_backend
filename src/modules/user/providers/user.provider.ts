import { Inject, Injectable } from '@nestjs/common';
import { CompanyProvider } from '../../company/providers/company.provider';
import { UserModel } from '../models/user.model';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { Op } from 'sequelize';

@Injectable()
export class UserProvider {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
  ) {}

  public async moveToCompany(
    userId: number,
    companyId: number,
  ): Promise<boolean> {
    return await this.companyProvider.appendUser(userId, companyId);
  }

  public async getAll({ filters }: UserFilterDto): Promise<UserModel[]> {
    const { except_group_id, ...filter } = filters;
    let where: any = {
      ...filter,
    };
    if (filters.except_group_id) {
      where = {
        group_id: {
          [Op.or]: [{ [Op.not]: filters.except_group_id }, { [Op.is]: null }],
        },
        ...filter,
      };
    }

    return UserModel.findAll({
      where,
    });
  }
}
