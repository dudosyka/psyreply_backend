import { Module } from "@nestjs/common";
import { AppController } from "./controllers/app.controller";
import { AppProvider } from "./providers/app.provider";
import { SequelizeModule } from "@nestjs/sequelize";
import mainConf from "./confs/main.conf";
import { BotModel } from "./models/bot.model";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule } from "@nestjs/config";
import dbConf from "./confs/db.conf";

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
      models: [
        BotModel
      ],
    }),
    ClientsModule.register([{
      name: "BOT_SERVICE",
      transport: Transport.TCP,
      options: {
        port: mainConf().microservicePort,
      }
    }])
  ],
  controllers: [AppController],
  providers: [AppProvider],
})
export class AppModule {}
