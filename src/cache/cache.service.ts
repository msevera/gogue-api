import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis';
import { RedisClientOptions } from '@redis/client';
import {
  instanceToPlain,
  plainToClass,  
} from 'class-transformer';
import { SetOptions, WrapOptions } from './types/set-options';
import { AbstractDocument } from '@app/common/database/abstract.entity';

export class CacheService {
  public tagTTL = 2;

  private client: RedisClientType<
    RedisDefaultModules & RedisModules,
    RedisFunctions,
    RedisScripts
  >;

  constructor(options: RedisClientOptions) {    
    this.client = createClient(options);
    this.client.connect();
    this.client.on('error', this.errorHandler);
  }

  errorHandler(error: any) {
    console.log('Redis error', error);
  }

  async flushAll() {
    await this.client.flushAll();
  }

  async quit() {
    await this.client.quit();
  }

  private stringify<T>(data: T) {
    const plain = instanceToPlain<T>(data);
    // console.log('plain', plain);
    return JSON.stringify(data, (k, v) => {
      // if (k === '_id') {
      //   return console.log('ID!!!', v);
      // }
      return typeof v === 'bigint' ? `${v.toString()}__BigInt__` : v;
    });
  }

  private parse<T>(type: { new(): T }, value: string) {
    const plain: object = JSON.parse(value, (k, v) => {
      return typeof v === 'string' && v.includes('__BigInt__')
        ? BigInt(v.split('__BigInt__')[0])
        : v;
    });
    return plainToClass<T, object>(type, plain);
  }

  async set<T>(key: string, value: T, options: SetOptions) {
    const json = this.stringify<T>(value);
    let pipe: any;
    if (options.expiration) {
      const pipeline = options.tx || this.client.multi();
      pipe = pipeline.set(key, json, {
        EX: options.expiration,
      });

      if (options.tag) {
        pipe = pipeline.sAdd(options.tag, key);
        pipe = pipeline.expire(
          options.tag,
          options.expiration + this.tagTTL,
        );
      }

      if (!options.tx) {
        await pipeline.exec();
      }
    } else {
      pipe = this.client.set(key, json);
    }

    await pipe;
  }

  async del(key: string | string[], pipeline?: any) {
    if (pipeline) {
      pipeline.del(key);
    } else {
      await this.client.del(key);
    }
  }

  async getKeys(template?: string) {
    return this.client.keys(template || '*');
  }

  async getKeysByTag(tag: string) {
    return this.client.sMembers(tag);
  }

  async delTag(tag: string, tx?: any) {
    const keys = await this.client.sMembers(tag);

    if (keys.length > 0) {
      try {
        await this.del(keys, tx);
      } catch (error) {
        console.log('Error deleting keys', tag, keys, error);
      }
    }

    try {
      await this.del(tag, tx);
    } catch (error) {
      console.log('Error deleting tag', tag, error);
    }
  }

  async get<T>(type: { new(): T }, key: string, pipeline?: any) {
    let json: string;
    if (pipeline) {
      json = pipeline.get(key);
    } else {
      json = await this.client.get(key);
    }    
    return this.parse<T>(type, json);
  }

  async select(db) {
    await this.client.select(db);
  }

  async createTx() {
    return this.client.multi();
  }

  async wrap<T extends AbstractDocument>(
    type: { new(): T },
    key: string,
    callback: () => Promise<T>,
    options: WrapOptions<T>,
  ): Promise<T> {
    const value = await this.get<T>(type, key, options.tx);
    
    if (value) {
      value.__fromCache = true;
      return value;
    }

    const result = await callback();
    if (result) {
      const tag = options.tag(result);
      await this.set<T>(key, result, {
        expiration: options.expiration,
        tag,
        tx: options.tx,
      });
      result.__fromCache = false;
    }

    return result;
  }
}
