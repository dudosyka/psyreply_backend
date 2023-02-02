import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppProvider } from './providers/app.provider';
import { SequelizeModule } from "@nestjs/sequelize";
import mainConf, { ProjectState } from "./confs/main.conf";
import { BotModel } from "./models/bot.model";
import { ClientsModule, Transport } from "@nestjs/microservices";

let db_conf: any = mainConf.db.dev;
if (mainConf.isDev == ProjectState.TEST_PROD)
  db_conf = mainConf.db.test_prod;
else if (mainConf.isDev == ProjectState.PROD)
  db_conf = mainConf.db.prod;

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...db_conf,
      dialect: "mysql",
      autoLoadModels: true,
      synchronize: true,
      models: [
        BotModel
      ],
    }),
    ClientsModule.register([{
      name: "BOT_SERVICE",
      transport: Transport.TCP,
      options: {
        port: mainConf.mainAppPort,
      }
    }])
  ],
  controllers: [AppController],
  providers: [AppProvider],
})
export class AppModule {}
