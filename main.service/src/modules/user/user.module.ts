import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../../strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import mainConf from '../../confs/main.conf';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import mailerConf from '../../confs/mailer.conf';
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

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, UserMessageModel, MessageModel, MessageTypeModel]),
    PassportModule,
    JwtModule.register({
      secret: mainConf.jwtConstants.secret,
      signOptions: { expiresIn: '100d' },
    }),
    MailerModule.forRoot({
      transport: mailerConf.transporterOptions,
      defaults: {
        from: mailerConf.sendOptions.from,
      },
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
