import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyModel } from './models/company.model';
import { CompanyProvider } from './providers/company.provider';
import { CompanyController } from './controllers/company.controller';
import { BlockModule } from '../block/block.module';
import { GroupModel } from './models/group.model';
import { AuthModule } from '@app/application/modules/auth/auth.module';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([GroupModel, CompanyModel]),
    BlockModule,
    AuthModule,
  ],
  providers: [CompanyProvider, AuthProvider],
  controllers: [CompanyController],
  exports: [
    AuthModule,
    BlockModule,
    CompanyProvider,
    SequelizeModule.forFeature([CompanyModel, GroupModel]),
  ],
})
export class CompanyModule {}
