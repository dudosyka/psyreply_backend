import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from "@nestjs/microservices";
import mainConf from "./confs/main.conf";

async function bootstrap() {
  const microserviceOptions = {
    transport: Transport.TCP,
    options: {
      port: mainConf.port
    }
  }
  const app = await NestFactory.createMicroservice(AppModule, microserviceOptions);
  await app.listen();
}
bootstrap();
