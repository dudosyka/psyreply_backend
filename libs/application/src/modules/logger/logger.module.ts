import { Module } from '@nestjs/common';
import { LoggerController } from './controllers/logger.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModel } from './models/logger.model';
import { LoggerProvider } from './providers/logger.provider';
import { MailerUtil } from '../../utils/mailer.util';
import { ChlenCollectionModel } from './models/chlen-collection.model';
import { ChlenSubscribersModel } from './models/chlen-subscribers.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LoggerModel,
      ChlenCollectionModel,
      ChlenSubscribersModel,
    ]),
  ],
  controllers: [LoggerController],
  providers: [LoggerProvider, MailerUtil],
  exports: [LoggerProvider],
})
export class LoggerModule {}
