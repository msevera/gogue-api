import { AuthContextPubSubType } from '@app/common/decorators/auth-context.decorator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReturnTypeFunc } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export type TopicBuilderType<T> = {
  type: string;
  data: T;
  authContexts: AuthContextPubSubType[];
}

export type TopicType<T> = {
  type: string;
  typeFunc: ReturnTypeFunc;
  builder: (data: T) => TopicBuilderType<T>
}

@Injectable()
export class PubSubService {
  pubSub: RedisPubSub;
  constructor(private readonly configService: ConfigService) { 
    this.pubSub = new RedisPubSub({
      connection: {
        host: this.configService.getOrThrow('REDIS_HOST'),
        port: this.configService.getOrThrow('REDIS_PORT'),
        db: this.configService.getOrThrow('REDIS_DB_PUBSUB'),
        retryStrategy: (retries) => {
          return Math.min(retries * 100, 3000);
        }
      },
    });
  }

  async publish<T>(topic: TopicType<T>, data: T) {
    const topicBuilder = topic.builder(data);
    await this.pubSub.publish(topic.type, {
      data: topicBuilder.data,
      authContexts: topicBuilder.authContexts
    });
  }

  async subscribe<T>(topic: TopicType<T>) {
    return this.pubSub.asyncIterableIterator(topic.type);
  }
}
