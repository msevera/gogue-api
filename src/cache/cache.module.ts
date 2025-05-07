import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisClientOptions } from '@redis/client';
import { CacheService } from './cache.service';
import { CACHE } from '@app/common/constants/cache.constants';

export interface CacheModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<RedisClientOptions>;
  inject?: any[];
}

@Global()
@Module({
  providers: [],
})
export class CacheModule {
  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: options.imports,
      providers: [
        {
          provide: CACHE,
          useFactory: async (...args: any[]) => {
            const opts = await options.useFactory(...args);
            return new CacheService(opts);
          },
          inject: options.inject || [],          
        },
      ],
      exports: [CACHE], // Export using the constant token
    };
  }
}
