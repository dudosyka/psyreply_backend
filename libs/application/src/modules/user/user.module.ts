import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { AuthModule } from '@app/application/modules/auth/auth.module';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { CompanyModule } from '../company/company.module';
import { UserProvider } from './providers/user.provider';
import { UserMessageModel } from '../bot/models/user-message.model';
import { MessageModel } from '../bot/models/message.model';
import { MessageTypeModel } from '../bot/models/message-type.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      UserMessageModel,
      MessageModel,
      MessageTypeModel,
    ]),
    AuthModule,
    CompanyModule,
  ],
  providers: [AuthProvider, UserProvider],
  controllers: [UserController],
  exports: [CompanyModule, AuthProvider, UserProvider],
})
export class UserModule {}
