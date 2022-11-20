import { Module } from '@nestjs/common';
import {BlockController} from "./controllers/block.controller";
import {SequelizeModule} from "@nestjs/sequelize";
import {BlockModel} from "./models/block.model";

@Module({
    imports: [SequelizeModule.forFeature([BlockModel])],
    controllers: [BlockController]
})
export class BlockModule {}
