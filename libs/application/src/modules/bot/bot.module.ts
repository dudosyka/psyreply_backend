import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModel } from './models/bot.model';
import { MessageModel } from './models/message.model';
import { MessageTypeModel } from './models/message-type.model';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BotProvider } from './providers/bot.provider';
import { ChatModule } from '../chat/chat.module';
import { UserModule } from '../user/user.module';
import { UserProvider } from '../user/providers/user.provider';
import { BotController } from './controllers/bot.controller';
import { LoggerModule } from '../logger/logger.module';
import mainConf from '../../config/main.conf';
import { ChatNoteModel } from '@app/application/modules/bot/models/chat-note.model';
import { BotMessageProvider } from '@app/application/modules/bot/providers/bot-message.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([
      BotModel,
      MessageModel,
      MessageTypeModel,
      ChatNoteModel,
    ]),
    LoggerModule,
    forwardRef(() => UserModule),
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
      MessageModel,
      MessageTypeModel,
      ChatNoteModel,
    ]),
    LoggerModule,
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
    UserProvider,
    BotProvider,
    ChatModule,
  ],
})
export class BotModule {}
