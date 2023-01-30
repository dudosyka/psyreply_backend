import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BotModel } from "./models/bot.model";
import { BotUserModel } from "./models/bot-user.model";
import { MessageModel } from "./models/message.model";
import { MessageTypeModel } from "./models/message-type.model";
import { UserMessageModel } from "./models/user-message.model";
import { BotProvider } from "./providers/bot.provider";
import { BotController } from "./controllers/bot.controller";
import { ChatGateway } from "./providers/chat.gateway";
import { JwtUtil } from "../../utils/jwt.util";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel
    ])
  ],
  providers: [BotProvider, ChatGateway, JwtUtil, JwtService],
  controllers: [BotController],
  exports: [
    BotProvider,
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel
    ]),
    JwtService,
    JwtUtil
  ],
})
export class BotModule {}