import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import mainConf from "./confs/main.conf";


// process.on('unhandledRejection', err => {
//   throw err;
// })
//
// process.on('uncaughtException', err => {
//   throw err;
// })

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(mainConf.isDev ? mainConf.devPort : mainConf.prodPort);
}

bootstrap();
