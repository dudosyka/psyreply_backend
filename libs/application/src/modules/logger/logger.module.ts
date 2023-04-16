import { Module } from '@nestjs/common';
import { LoggerController } from './controllers/logger.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModel } from './models/logger.model';
import { LoggerProvider } from './providers/logger.provider';
import { MailerUtil } from '../../utils/mailer.util';

@Module({
  imports: [SequelizeModule.forFeature([LoggerModel])],
  controllers: [LoggerController],
  providers: [LoggerProvider, MailerUtil],
  exports: [LoggerProvider],
})
export class LoggerModule {}
