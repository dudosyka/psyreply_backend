import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CompanyModel } from "./models/company.model";
import { CompanyProvider } from "./providers/company.provider";
import { CompanyController } from "./controllers/company.controller";
import { BlockModule } from "../block/block.module";
import { CompanyUserModel } from "./models/company-user.model";

@Module({
  imports: [SequelizeModule.forFeature([CompanyModel, CompanyUserModel]), BlockModule],
  providers: [CompanyProvider],
  controllers: [CompanyController],
  exports: [CompanyProvider, SequelizeModule.forFeature([CompanyModel, CompanyUserModel])]
})
export class CompanyModule {
}
