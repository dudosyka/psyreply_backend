import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import mainConf, { ProjectState } from "./confs/main.conf";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  let port = mainConf.devPort
  if (mainConf.isDev == ProjectState.TEST_PROD)
    port = mainConf.testProdPort;
  else if (mainConf.isDev == ProjectState.PROD)
    port = mainConf.prodPort
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { retryAttempts: 5, retryDelay: 3000, port: mainConf.microservicePort },
  });

  await app.startAllMicroservices();
  await app.listen(port);
}

bootstrap().then(() => {});
