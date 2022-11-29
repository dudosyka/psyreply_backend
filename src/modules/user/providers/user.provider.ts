import { Inject, Injectable } from "@nestjs/common";
import { CompanyProvider } from "../../company/providers/company.provider";

@Injectable()
export class UserProvider {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider
  ) {}

  public async moveToCompany(userId: number, companyId: number): Promise<boolean> {
    return await this.companyProvider.appendUser(userId, companyId);
  }
}
