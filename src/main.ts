import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
    },
  });

  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [configService.get<string>('KAFKA_BROKER')],
        logLevel: 4,
        sasl: {
          mechanism: 'plain',
          username: configService.get<string>('KAFKA_USERNAME'),
          password: configService.get<string>('KAFKA_PASSWORD'),
        },
      },
      consumer: {
        groupId: configService.get<string>('KAFKA_PROCESSING_GROUP'),
      },
      run: {
        autoCommit: false,
      }
    }
  });

  // Increase payload size limit to 50MB
  app.use(json({ limit: '50mb' }));

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT') ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
