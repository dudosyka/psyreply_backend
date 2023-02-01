import { forwardRef, Module } from "@nestjs/common";
import { ChatProvider } from "./providers/chat.provider";
import { ChatController } from "./controllers/chat.controller";
import { ChatGateway } from "./providers/chat.gateway";
import { JwtUtil } from "../../utils/jwt.util";
import { JwtService } from "@nestjs/jwt";
import { BotModule } from "../bot/bot.module";

@Module({
  imports: [
    forwardRef(() => BotModule)
  ],
  providers: [ChatProvider, ChatGateway, JwtUtil, JwtService],
  controllers: [ChatController],
  exports: [
    ChatGateway
  ]
})
export class ChatModule {}