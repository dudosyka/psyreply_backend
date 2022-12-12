import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CompanyModel } from "./models/company.model";
import { CompanyProvider } from "./providers/company.provider";
import { CompanyController } from "./controllers/company.controller";
import { BlockModule } from "../block/block.module";
import { GroupModel } from "./models/group.model";

@Module({
  imports: [SequelizeModule.forFeature([GroupModel, CompanyModel]), BlockModule],
  providers: [CompanyProvider],
  controllers: [CompanyController],
  exports: [CompanyProvider, SequelizeModule.forFeature([CompanyModel])]
})
export class CompanyModule {
}
