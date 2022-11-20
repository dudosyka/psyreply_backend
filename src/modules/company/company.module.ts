import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {CompanyModel} from "./models/company.model";

@Module({
    imports: [SequelizeModule.forFeature([CompanyModel])],
})
export class CompanyModule {}
