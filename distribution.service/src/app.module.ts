import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import dbConf from "./confs/db.conf";
import mainConf from "./confs/main.conf";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env'],
      load: [dbConf, mainConf],
      isGlobal: true
    }),
    SequelizeModule.forRoot({
      ...dbConf(),
      dialect: "mysql",
      autoLoadModels: true,
      synchronize: true,
      models: [],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
