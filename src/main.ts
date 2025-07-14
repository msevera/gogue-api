import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SASLOptions } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
    },
  });

  const configService = app.get(ConfigService);
  const kafkaUserName = configService.get<string>('KAFKA_USERNAME');
  const kafkaPassword = configService.get<string>('KAFKA_PASSWORD');
  const sasl = kafkaUserName && kafkaPassword ? {
    mechanism: 'plain',
    username: kafkaUserName,
    password: kafkaPassword,
  } : undefined;
  
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: [configService.get<string>('KAFKA_BROKER')],
  //       logLevel: 4,
  //       sasl: sasl as SASLOptions,
  //     },
  //     consumer: {
  //       groupId: configService.get<string>('KAFKA_PROCESSING_GROUP'),
  //     },
  //     run: {
  //       autoCommit: false,
  //     }
  //   }
  // });

  app.use(json({ limit: '50mb' }));

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT') ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
