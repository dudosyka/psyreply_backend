import { forwardRef, Module } from '@nestjs/common';
import { ChatProvider } from './providers/chat.provider';
import { ChatBotController } from './controllers/chat-bot.controller';
import { ChatGateway } from './providers/chat.gateway';
import { JwtUtil } from '../../utils/jwt.util';
import { JwtService } from '@nestjs/jwt';
import { BotModule } from '../bot/bot.module';
import { ChatController } from '@app/application/modules/chat/controllers/chat.controller';
import { ChatNotesProvider } from '@app/application/modules/chat/providers/chat-notes.provider';

@Module({
  imports: [forwardRef(() => BotModule)],
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
