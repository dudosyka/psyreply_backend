import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {MetricModel} from "./models/metric.model";

@Module({
    imports: [SequelizeModule.forFeature([MetricModel])],
})
export class MetricModule {}
