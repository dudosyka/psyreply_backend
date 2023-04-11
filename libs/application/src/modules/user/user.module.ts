import { forwardRef, Module } from '@nestjs/common';
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
import { BotModule } from '@app/application/modules/bot/bot.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      UserMessageModel,
      MessageModel,
      MessageTypeModel,
    ]),
    forwardRef(() => BotModule),
    AuthModule,
    CompanyModule,
  ],
  providers: [AuthProvider, UserProvider],
  controllers: [UserController],
  exports: [
    SequelizeModule.forFeature([
      UserModel,
      UserMessageModel,
      MessageModel,
      MessageTypeModel,
    ]),
    AuthModule,
    CompanyModule,
    AuthProvider,
    UserProvider,
  ],
})
export class UserModule {}
