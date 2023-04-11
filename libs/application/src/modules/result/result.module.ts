import { Module } from '@nestjs/common';
import { ResultController } from './controllers/result.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResultModel } from './models/result.model';
import { BlockModule } from '../block/block.module';
import { TestModule } from '../test/test.module';
import { BlockProvider } from '../block/providers/block.provider';
import { TestProvider } from '../test/providers/test.provider';
import { ResultProvider } from './providers/result.provider';
import { CompanyModule } from '../company/company.module';
import { CompanyProvider } from '../company/providers/company.provider';
import { GroupBlockStatModel } from './models/group-block-stat.model';
import { ChatModule } from '@app/application/modules/chat/chat.module';
import { BotModule } from '@app/application/modules/bot/bot.module';
import { UserModule } from '@app/application/modules/user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ResultModel, GroupBlockStatModel]),
    BlockModule,
    TestModule,
    CompanyModule,
    UserModule,
    BotModule,
    ChatModule,
  ],
  controllers: [ResultController],
  providers: [ResultProvider, BlockProvider, TestProvider, CompanyProvider],
})
export class ResultModule {}
