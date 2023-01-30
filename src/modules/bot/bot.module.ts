import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BotModel } from "./models/bot.model";
import { BotUserModel } from "./models/bot-user.model";
import { MessageModel } from "./models/message.model";
import { MessageTypeModel } from "./models/message-type.model";
import { UserMessageModel } from "./models/user-message.model";

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
  providers: [],
  controllers: [],
  exports: [],
})
export class BotModule {}