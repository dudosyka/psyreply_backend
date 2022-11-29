import { Module } from '@nestjs/common';
import {ResultController} from "./controllers/result.controller";
import {SequelizeModule} from "@nestjs/sequelize";
import {ResultModel} from "./models/result.model";
import { BlockModule } from "../block/block.module";
import { TestModule } from "../test/test.module";
import { BlockProvider } from "../block/providers/block.provider";
import { TestProvider } from "../test/providers/test.provider";
import { ResultProvider } from "./providers/result.provider";

@Module({
    imports: [SequelizeModule.forFeature([ResultModel]), BlockModule, TestModule],
    controllers: [ResultController],
    providers: [ResultProvider, BlockProvider, TestProvider]
})
export class ResultModule {}
