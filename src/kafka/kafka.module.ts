import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SASLOptions } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const kafkaUserName = configService.get<string>('KAFKA_USERNAME');
          const kafkaPassword = configService.get<string>('KAFKA_PASSWORD');
          const sasl = kafkaUserName && kafkaPassword ? {
            mechanism: 'plain',
            username: kafkaUserName,
            password: kafkaPassword,
          } : undefined;

          return ({
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: [configService.get<string>('KAFKA_BROKER')],
                sasl: sasl as SASLOptions,
              },
            },
          })
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule { }
