import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '@app/application/modules/user/models/user.model';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { AuthController } from '@app/application/modules/auth/controllers/auth.controller';
import { LocalStrategy } from '@app/application/strategies/local.strategy';
import { JwtStrategy } from '@app/application/strategies/jwt.strategy';
import { BcryptUtil } from '@app/application/utils/bcrypt.util';
import { MailerUtil } from '@app/application/utils/mailer.util';
import { JwtUtil } from '@app/application/utils/jwt.util';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtOptionsModule } from '@app/application/modules/auth/providers/jwt.options.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerOptionsModule } from '@app/application/modules/auth/providers/mailer.options.module';
import { FilesModule } from '@app/application/modules/files/files.module';
import { FilesProvider } from '@app/application/modules/files/providers/files.provider';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtOptionsModule,
    }),
    MailerModule.forRootAsync({
      useClass: MailerOptionsModule,
    }),
    FilesModule,
  ],
  providers: [
    AuthProvider,
    LocalStrategy,
    JwtStrategy,
    BcryptUtil,
    MailerUtil,
    JwtUtil,
    FilesProvider,
  ],
  controllers: [AuthController],
  exports: [
    SequelizeModule.forFeature([UserModel]),
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtOptionsModule,
    }),
    MailerModule.forRootAsync({
      useClass: MailerOptionsModule,
    }),
    AuthProvider,
    LocalStrategy,
    JwtStrategy,
    BcryptUtil,
    MailerUtil,
    JwtUtil,
    FilesModule,
  ],
})
export class AuthModule {}
