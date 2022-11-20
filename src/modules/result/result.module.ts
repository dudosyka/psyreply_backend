import { Module } from '@nestjs/common';
import {ResultController} from "./controllers/result.controller";
import {SequelizeModule} from "@nestjs/sequelize";
import {ResultModel} from "./models/result.model";

@Module({
    imports: [SequelizeModule.forFeature([ResultModel])],
    controllers: [ResultController]
})
export class ResultModule {}
