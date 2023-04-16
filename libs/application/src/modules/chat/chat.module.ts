import { forwardRef, Module } from '@nestjs/common';
import { ChatProvider } from './providers/chat.provider';
import { ChatBotController } from './controllers/chat-bot.controller';
import { ChatGateway } from './providers/chat.gateway';
import { JwtUtil } from '../../utils/jwt.util';
import { JwtService } from '@nestjs/jwt';
import { BotModule } from '../bot/bot.module';
import { ChatController } from '@app/application/modules/chat/controllers/chat.controller';
import { ChatNotesProvider } from '@app/application/modules/chat/providers/chat-notes.provider';
import { LoggerModule } from '@app/application/modules/logger/logger.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatModel, ChatBotModel, ChatMessageModel]),
    forwardRef(() => BotModule),
    LoggerModule,
  ],
  providers: [
    ChatNotesProvider,
    ChatProvider,
    ChatGateway,
    JwtUtil,
    JwtService,
  ],
  controllers: [ChatBotController, ChatController],
  exports: [ChatGateway],
})
export class ChatModule {}
