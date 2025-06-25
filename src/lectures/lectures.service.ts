import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LecturesRepository } from './lectures.repository';
import { Lecture } from './entities/lecture.entity';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { LectureAgentInputDto } from 'src/lecture-agent/dto/lecture-agent-input.dto';
import { LectureAgentService } from 'src/lecture-agent/lecture-agent.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { LectureCreatingTopic } from './topics/lecture-creating.topic';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { ClientProxy } from '@nestjs/microservices';
import { LectureTTSCompletedServiceDto } from './dto/lecture-tts-completed.service.dto';
import { LectureCreatedServiceDto } from './dto/lecture-created.service.dto';
import { AbstractService } from '@app/common/services/abstract.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Injectable()
export class LecturesService extends AbstractService<Lecture> {
  constructor(
    private readonly lecturesRepository: LecturesRepository,
    @Inject(forwardRef(() => LectureAgentService))
    private readonly lectureAgentService: LectureAgentService,
    private readonly pubSubService: PubSubService,
    private readonly embeddingsService: EmbeddingsService,
    @Inject('KAFKA_PRODUCER') private client: ClientProxy
  ) {
    super(lecturesRepository);
  }

  async createOne(authContext: AuthContextType, input: CreateLectureDto) {
    return this.lecturesRepository.create(authContext, {
      duration: input.duration,
      input: input.input,
      topic: input.topic,
      title: input.title,
      emoji: input.emoji,
      sections: input.sections,
    });
  }

  async updateOne(authContext: AuthContextType, id: string, updateLectureDto: UpdateLectureDto) {
    return this.lecturesRepository.updateOne(authContext, { id }, {
      $set: {
        ...updateLectureDto,
        topicEmbeddings: updateLectureDto.topic ? await this.embeddingsService.embeddings.embedQuery(updateLectureDto.topic) : undefined,
      }
    });
  }


  async findOnePending(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.lecturesRepository.findOnePending(authContext);
    return resource;
  }

  async find(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    return this.lecturesRepository.find(authContext, {
      'creationEvent.name': 'DONE'
    }, pagination);
  }

  async deleteOne(authContext: AuthContextType, id: string) {
    return this.lecturesRepository.deleteOne(authContext, { id });
  }

  async callAgent(authContext: AuthContextType, lectureAgentInput: LectureAgentInputDto) {
    const { duration, input } = lectureAgentInput;
    const thread_id = `${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;

    let lecture = await this.lecturesRepository.create(authContext, {
      duration,
      input,
      topic: '',
      title: '',
      emoji: '',
      sections: [],
      creationEvent: {
        name: 'INIT'
      },
    });

    try {
      await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
      const eventStream = await this.lectureAgentService.graph.streamEvents(
        {
          duration,
          input
        },
        {
          configurable: {
            thread_id,
            authContext,
            wordsPerMinute: 160,
            // wordsPerMinute: 5,
            lectureId: lecture.id
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
            lecture = await this.lecturesRepository.findOne(authContext, { id: lecture.id });
            await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
            if (eventName === 'FINALIZING') {
              await this.client.emit<any, LectureCreatedServiceDto>('lecture.created', {
                id: lecture.id,
                topic: lecture.topic,
                title: lecture.title,
                emoji: lecture.emoji,
                userId: lecture.userId,
                workspaceId: lecture.workspaceId,
                sections: lecture.sections.map(section => ({
                  title: section.title,
                  content: section.content
                }))
              });
            }
          }
        } catch (error) {
          console.log('error', error)
        }
      }
    } catch (error) {
      console.log('CallAgent error', error)
      lecture = await this.lecturesRepository.findOne(authContext, { id: lecture.id });
      await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
    }
  }

  async generateAudio(authContext: AuthContextType, id: string) {
    const lecture = await this.lecturesRepository.findOne(false, { id });
    await this.client.emit<any, LectureCreatedServiceDto>('lecture.created', {
      id: lecture.id,
      topic: lecture.topic,
      title: lecture.title,
      emoji: lecture.emoji,
      userId: lecture.userId,
      workspaceId: lecture.workspaceId,
      sections: lecture.sections.map(section => ({
        title: section.title,
        content: section.content
      }))
    });
  }

  async handleTTSCompleted(lectureTTSCompleted: LectureTTSCompletedServiceDto) {
    const { id, audio, aligners, image } = lectureTTSCompleted;
    const lecture = await this.lecturesRepository.updateOne(false, { id }, {
      audio,
      aligners,
      image,
      creationEvent: {
        name: 'DONE'
      },
    });
    await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
  }
} 