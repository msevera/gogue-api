import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Glimpse } from './entities/glimpse.entity';
import { AbstractService } from '@app/common/services/abstract.service';
import { GlimpsesRepository } from './glimpses.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { GlimpsesCheckpointRepository } from './glimpses-checkpoint.repository';
import { CreateGlimpseDto } from './dto/create-glimpse.dto';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { GlimpsesAgentService } from './glimpses-agent.service';
import { GlimpsesStatusRepository } from './glimpses-status.repository';
import { SortOrder } from '@app/common/database/options';
import { GlimpseStatusUpdatedTopic } from './topics/glimpse-status-updated.topic';
import { GlimpseStatus } from './entities/glimpse-status.entity';
import { SetGlimpseViewedInputDto } from './dto/set-glimpse-viewed.dto';

@Injectable()
export class GlimpsesService extends AbstractService<Glimpse> {
  constructor(
    private readonly glimpsesRepository: GlimpsesRepository,
    private readonly glimpsesCheckpointRepository: GlimpsesCheckpointRepository,
    private readonly glimpsesStatusRepository: GlimpsesStatusRepository,
    private readonly pubSubService: PubSubService,
    @Inject(forwardRef(() => GlimpsesAgentService))
    private readonly glimpsesAgentService: GlimpsesAgentService

  ) {
    super(glimpsesRepository);
  }

  async createOne(authContext: AuthContextType, input: CreateGlimpseDto) {
    return this.glimpsesRepository.create(authContext, {
      topicId: input.topicId,
      content: input.content,
      viewed: false,
      annotations: input.annotations
    });
  }

  async findCheckpointByTopicId(authContext: AuthContextType, topicId: string) {
    return this.glimpsesCheckpointRepository.findOneByTopicId(authContext, topicId);
  }

  async getNonViewedGlimpses(authContext: AuthContextType) {
    return this.glimpsesRepository.find(authContext, { viewed: false });
  }

  async addToCheckpointPreviousContent(authContext: AuthContextType, topicId: string, glimpseId: string, content: string) {
    let checkpoint = await this.glimpsesCheckpointRepository.findOneByTopicId(authContext, topicId);
    if (!checkpoint) {
      checkpoint = await this.glimpsesCheckpointRepository.create(authContext, {
        topicId,
        previousContent: [{
          glimpseId,
          content
        }]
      });
    } else {
      checkpoint = await this.glimpsesCheckpointRepository.updateOne(authContext, { topicId }, {
        $push: {
          previousContent: {
            glimpseId,
            content
          }
        }
      });
    }
    return checkpoint;
  }

  async checkGlimpseStatus(authContext: AuthContextType) {
    let glimpseStatus = await this.glimpsesStatusRepository.findOne(authContext, { userId: authContext.user.id });
    if (!glimpseStatus) {
      glimpseStatus = await this.glimpsesStatusRepository.create(authContext, { status: 'NOT_READY' });
    }
    return glimpseStatus;
  }

  async updateGlimpseStatus(authContext: AuthContextType, status: string) {
    let glimpseStatus = await this.glimpsesStatusRepository.findOne(authContext, { userId: authContext.user.id });
    if (!glimpseStatus) {
      glimpseStatus = await this.glimpsesStatusRepository.create(authContext, { status });
    } else {
      glimpseStatus = await this.glimpsesStatusRepository.updateOne(authContext, { userId: authContext.user.id }, { status });
    }


    await this.pubSubService.publish<GlimpseStatus>(GlimpseStatusUpdatedTopic, glimpseStatus);

    return glimpseStatus;
  }

  async callAgent(authContext: AuthContextType) {
    const thread_id = `glimpses-${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;

    try {
      const eventStream = await this.glimpsesAgentService.graph.streamEvents(
        {

        },
        {
          configurable: {
            thread_id,
            authContext
          },
          version: 'v2',
        },
      );


      for await (const item of eventStream) {
        const { event, name, data } = item;
        try {
          const isCustomEvent = event === 'on_custom_event';
          if (isCustomEvent) {
            let eventName: string;
            let dataChunk: any = {};
            eventName = name;
            dataChunk = data.chunk;
            // await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
          }
        } catch (error) {
          console.log('error', error)
        }
      }      
    } catch (error) {
      console.log('CallAgent error', error)
    }
  }

  async findLatest(authContext: AuthContextType, limit?: number, viewed?: boolean) {
    const query = {};

    if (typeof viewed !== 'undefined') {
      query['viewed'] = viewed;
    }

    const result = await this.glimpsesRepository.find(authContext, query, {
      limit: limit || 10,
      sort: [
        {
          // @ts-ignore
          by: 'createdAt',
          order: SortOrder.DESC
        }
      ]
    });

    return result;
  }

  async setGlimpseViewed(authContext: AuthContextType, input: SetGlimpseViewedInputDto) {
    await this.updateGlimpseStatus(authContext, 'OLD');
    return this.glimpsesRepository.updateOne(authContext, { id: input.id }, { $set: { viewed: true } });
  }

  async setGlimsesQueries(authContext: AuthContextType, queries: { id: string, query: string }[]) {
    return this.glimpsesRepository.setQueries(authContext, queries);
  }
}