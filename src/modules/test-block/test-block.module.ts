import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {TestBlockModel} from "./models/test-block.model";

@Module({
    imports: [SequelizeModule.forFeature([TestBlockModel])],})
export class TestBlockModule {}
