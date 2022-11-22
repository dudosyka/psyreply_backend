import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {UserModel} from "./models/user.model";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "../../strategies/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import mainConf from "../../confs/main.conf";
import { JwtStrategy } from "../../strategies/jwt.strategy";
import { MailerModule } from "@nestjs-modules/mailer";
import mailerConf from "../../confs/mailer.conf";
import { AuthService } from "./providers/auth.service";
import { BcryptUtil } from "../../utils/bcrypt.util";
import { MailerUtil } from "../../utils/mailer.util";
import { JwtUtil } from "../../utils/jwt.util";
import { AuthController } from "./controllers/auth.controller";

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel
    ]),
    PassportModule,
    JwtModule.register({
      secret: mainConf.jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    MailerModule.forRoot({
      transport: mailerConf.transporterOptions,
      defaults: {
        from: mailerConf.sendOptions.from,
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, BcryptUtil, MailerUtil, JwtUtil],
  controllers: [UserController, AuthController]
})
export class UserModule {}
