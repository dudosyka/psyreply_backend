import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BotModel } from "./models/bot.model";
import { BotUserModel } from "./models/bot-user.model";
import { MessageModel } from "./models/message.model";
import { MessageTypeModel } from "./models/message-type.model";
import { UserMessageModel } from "./models/user-message.model";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { BotProvider } from "./providers/bot.provider";
import { ChatModule } from "../chat/chat.module";
import { UserModule } from "../user/user.module";
import { UserProvider } from "../user/providers/user.provider";
import { BotController } from "./controllers/bot.controller";
import { LoggerModule } from "../logger/logger.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel
    ]),
    ClientsModule.register([{
      name: "SERVICE",
      transport: Transport.TCP,
      options: {
        port: 3000
      }
    }]),
    UserModule,
    LoggerModule,
    forwardRef(() => ChatModule)
  ],
  providers: [BotProvider, UserProvider],
  controllers: [BotController],
  exports: [
    SequelizeModule.forFeature([
      BotModel,
      BotUserModel,
      MessageModel,
      MessageTypeModel,
      UserMessageModel
    ]),
    BotProvider
  ]
})
export class BotModule {}