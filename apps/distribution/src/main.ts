import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mainConf from './confs/main.conf';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const microserviceOptions = {
    transport: Transport.TCP,
    options: {
      port: mainConf().distributionMicroservicePort,
    },
  };
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
  await app.listen();
}
bootstrap();
