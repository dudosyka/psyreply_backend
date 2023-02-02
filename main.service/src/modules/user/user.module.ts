import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../../strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthService } from './providers/auth.service';
import { BcryptUtil } from '../../utils/bcrypt.util';
import { MailerUtil } from '../../utils/mailer.util';
import { JwtUtil } from '../../utils/jwt.util';
import { AuthController } from './controllers/auth.controller';
import { CompanyModule } from '../company/company.module';
import { UserProvider } from './providers/user.provider';
import { UserMessageModel } from "../bot/models/user-message.model";
import { MessageModel } from "../bot/models/message.model";
import { MessageTypeModel } from "../bot/models/message-type.model";
import { JwtOptionsModule } from "./providers/jwt.options.module";
import { MailerOptionsModule } from "./providers/mailer.options.module";

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, UserMessageModel, MessageModel, MessageTypeModel]),
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtOptionsModule
    }),
    MailerModule.forRootAsync({
      useClass: MailerOptionsModule,
    }),
    CompanyModule,
  ],
  providers: [
    AuthService,
    UserProvider,
    LocalStrategy,
    JwtStrategy,
    BcryptUtil,
    MailerUtil,
    JwtUtil,
  ],
  controllers: [UserController, AuthController],
  exports: [
    CompanyModule,
    AuthService,
    UserProvider,
    LocalStrategy,
    JwtStrategy,
    BcryptUtil,
    MailerUtil,
    JwtUtil,
  ]
})
export class UserModule {}
