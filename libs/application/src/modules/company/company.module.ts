import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyModel } from './models/company.model';
import { CompanyProvider } from './providers/company.provider';
import { CompanyController } from './controllers/company.controller';
import { BlockModule } from '../block/block.module';
import { GroupModel } from './models/group.model';
import { AuthModule } from '@app/application/modules/auth/auth.module';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { BotModule } from '@app/application/modules/bot/bot.module';
import { BotProvider } from '@app/application/modules/bot/providers/bot.provider';
import { CompanyDistributionController } from '@app/application/modules/company/controllers/company-distribution.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([GroupModel, CompanyModel]),
    forwardRef(() => BotModule),
    BlockModule,
    AuthModule,
  ],
  providers: [CompanyProvider, BotProvider, AuthProvider],
  controllers: [CompanyController, CompanyDistributionController],
  exports: [
    AuthModule,
    BotModule,
    BlockModule,
    CompanyProvider,
    SequelizeModule.forFeature([CompanyModel, GroupModel]),
  ],
})
export class CompanyModule {}
