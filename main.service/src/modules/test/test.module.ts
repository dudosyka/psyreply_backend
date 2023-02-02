import { Module } from '@nestjs/common';
import { TestController } from './controllers/test.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestModel } from './models/test.model';
import { TestProvider } from './providers/test.provider';
import { QuestionModule } from '../question/question.module';
import { BlockModule } from '../block/block.module';
import { ShlyapaMarkupUtil } from '../../utils/shlyapa-markup.util';
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigModule } from "../../confs/multer-config.module";

@Module({
  imports: [
    SequelizeModule.forFeature([TestModel]),
    QuestionModule,
    BlockModule,
    MulterModule.registerAsync({
      useClass: MulterConfigModule
    }),
  ],
  providers: [TestProvider, ShlyapaMarkupUtil],
  controllers: [TestController],
  exports: [
    ShlyapaMarkupUtil,
    QuestionModule,
    TestProvider,
    SequelizeModule.forFeature([TestModel]),
  ],
})
export class TestModule {}
