import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {CompanyModel} from "./models/company.model";
import { CompanyProvider } from "./providers/company.provider";
import { CompanyController } from "./controllers/company.controller";
import { BlockModule } from "../block/block.module";

@Module({
    imports: [SequelizeModule.forFeature([CompanyModel]), BlockModule],
    providers: [CompanyProvider],
    controllers: [CompanyController]
})
export class CompanyModule {}
