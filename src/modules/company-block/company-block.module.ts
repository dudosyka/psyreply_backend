import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {CompanyBlockModel} from "./models/company-block.model";

@Module({
    imports: [SequelizeModule.forFeature([CompanyBlockModel])],
})
export class CompanyBlockModule {}
