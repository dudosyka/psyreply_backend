import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import dbConf from './confs/db.conf';
import mainConf from './confs/main.conf';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionModule } from './distribution/distribution.module';
import { DistributionBlockModel } from './distribution/models/distribution-block.model';
import { DistributionMessageModel } from './distribution/models/distribution-message.model';
import { DistributionMessageTypeModel } from './distribution/models/distribution-message-type.model';
import { DistributionRecipientsModel } from './distribution/models/distribution-recipients.model';
import { UserModel } from './distribution/models/user.model';
import { DistributionModel } from './distribution/models/distribution.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      load: [dbConf, mainConf],
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...dbConf(),
      dialect: 'mysql',
      autoLoadModels: true,
      synchronize: true,
      models: [
        DistributionModel,
        DistributionBlockModel,
        DistributionMessageModel,
        DistributionMessageTypeModel,
        DistributionRecipientsModel,
        UserModel,
      ],
    }),
    DistributionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
