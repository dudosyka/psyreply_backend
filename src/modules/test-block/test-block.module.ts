import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TestBlockModel } from "./models/test-block.model";
import { TestBlockProvider } from "./providers/test-block.provider";

@Module({
  imports: [SequelizeModule.forFeature([TestBlockModel])],
  providers: [TestBlockProvider],
  exports: [TestBlockProvider]
})
export class TestBlockModule {
}
