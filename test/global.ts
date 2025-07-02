import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';
import { mongooseLeanGetters } from 'mongoose-lean-getters';
import mongooseLeanDefaults from 'mongoose-lean-defaults';
import { CacheModule } from '../src/cache/cache.module';
import { CacheService } from '../src/cache/cache.service';
import { Connection } from 'mongoose';

let cache;
let mod: TestingModule;

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const defineBeforeEach = async ({ imports, providers }) => {
  mod = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('DB'),
          connectionFactory: (connection) => {
            connection.plugin(mongooseLeanVirtuals); // Apply the plugin globally
            connection.plugin(mongooseLeanGetters); // Apply the plugin globally
            connection.plugin(mongooseLeanDefaults); // Apply the plugin globally
            return connection;
          },
        }),
        inject: [ConfigService],
      }),
      CacheModule.forRootAsync({
        useFactory: async (configService: ConfigService) => {
          return {
            socket: {
              host: configService.getOrThrow('REDIS_HOST'),
              port: configService.getOrThrow('REDIS_PORT'),
              reconnectStrategy: () => 1000,
            },
            database: configService.getOrThrow('REDIS_DB'),
          };
        },
        inject: [ConfigService],
      }),
      ...imports,
    ],
    providers: [CacheService, Connection, ...providers],
  }).compile();

  cache = mod.get<CacheService>(CacheService);
  await cache.flushAll();
  return {
    cache,
    module: mod,
    config: mod.get<ConfigService>(ConfigService),
  };
};

afterEach(async () => {
 // await cache.flushAll();

  // const connection = mod.get(getConnectionToken()) as Connection;
  // for (const modelName in connection.models) {
  //   const model = connection.models[modelName];
  //   await model.deleteMany({}); // This removes all documents from the model's collection
  // }
});

afterAll(async () => {
  await cache.quit();
  const connection = mod.get(getConnectionToken()) as Connection;
  // await connection.db.dropDatabase();
  await connection.destroy(true);
});
