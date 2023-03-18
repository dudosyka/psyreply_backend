import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModel } from './models/bot.model';
import { BotUserModel } from './models/bot-user.model';
import { MessageModel } from './models/message.model';
import { MessageTypeModel } from './models/message-type.model';
import { UserMessageModel } from './models/user-message.model';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BotProvider } from './providers/bot.provider';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';
import { UserProvider } from '../user/providers/user.provider';
import { BotController } from './controllers/bot.controller';
import { LoggerModule } from '../logger/logger.module';
import mainConf from '../../config/main.conf';
import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';
import { BotMessageProvider } from '@app/application/modules/bot/providers/bot-message.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel,
      UserNoteModel,
    ]),
    UserModule,
    LoggerModule,
    forwardRef(() => ChatModule),
  ],
  providers: [
    {
      provide: 'SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: mainConf().tgMicroservicePort,
          },
        });
      },
    },
    BotMessageProvider,
    BotProvider,
    UserProvider,
  ],
  controllers: [BotController],
  exports: [
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel,
    ]),
    BotProvider,
  ],
})
export class BotModule {}
