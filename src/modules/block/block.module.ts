import { Module } from "@nestjs/common";
import { BlockController } from "./controllers/block.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { BlockModel } from "./models/block.model";
import { BlockProvider } from "./providers/block.provider";
import { TestBlockModule } from "../test-block/test-block.module";

@Module({
  imports: [SequelizeModule.forFeature([BlockModel]), TestBlockModule],
  controllers: [BlockController],
  providers: [BlockProvider],
  exports: [TestBlockModule, BlockProvider, SequelizeModule.forFeature([BlockModel])]
})
export class BlockModule {
}
