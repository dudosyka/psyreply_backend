import { forwardRef, Module } from '@nestjs/common';
import { DistributionController } from './controllers/distribution.controller';
import { DistributionProvider } from './providers/distribution.provider';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionContactsModels } from '@app/application/modules/distribution/models/distribution-contacts.models';
import { DistributionBlockModel } from '@app/application/modules/distribution/models/distribution-block.model';
import { DistributionMessageModel } from '@app/application/modules/distribution/models/distribution-message.model';
import { DistributionMessageTypeModel } from '@app/application/modules/distribution/models/distribution-message-type.model';
import { UserModule } from '@app/application/modules/user/user.module';
import { DistributionModel } from '@app/application/modules/distribution/models/distribution.model';
import { BotModule } from '@app/application/modules/bot/bot.module';
import { BlockModule } from '@app/application/modules/block/block.module';
import { ChatModule } from '@app/application/modules/chat/chat.module';
import { DistributionBlockController } from '@app/application/modules/distribution/controllers/distribution-block.controller';
import { DistributionGreetingsController } from '@app/application/modules/distribution/controllers/distribution-greetings.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DistributionModel,
      DistributionContactsModels,
      DistributionBlockModel,
      DistributionMessageModel,
      DistributionMessageTypeModel,
    ]),
    UserModule,
    BotModule,
    BlockModule,
    forwardRef(() => ChatModule),
  ],
  exports: [
    SequelizeModule.forFeature([
      DistributionModel,
      DistributionContactsModels,
      DistributionBlockModel,
      DistributionMessageModel,
      DistributionMessageTypeModel,
    ]),
  ],
  controllers: [
    DistributionController,
    DistributionBlockController,
    DistributionGreetingsController,
  ],
  providers: [DistributionProvider],
})
export class DistributionModule {}
