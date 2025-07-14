import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LecturesRepository } from './lectures.repository';
import { Lecture } from './entities/lecture.entity';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { LectureAgentInputDto } from '../lecture-agent/dto/lecture-agent-input.dto';
import { LectureAgentService } from '../lecture-agent/lecture-agent.service';
import { PubSubService } from '../pubsub/pubsub.service';
import { LectureCreatingTopic } from './topics/lecture-creating.topic';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { ClientProxy } from '@nestjs/microservices';
import { LectureTTSCompletedServiceDto } from './dto/lecture-tts-completed.service.dto';
import { LectureCreatedServiceDto } from './dto/lecture-created.service.dto';
import { AbstractService } from '@app/common/services/abstract.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { FindLecturesInputDto } from './dto/find-lectures.dto';
import { LectureMetadataService } from 'src/lecture-metadata/lecture-metadata.service';
import { SearchLecturesInputDto } from './dto/search-lectures.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LecturesService extends AbstractService<Lecture> {
  constructor(
    private readonly lecturesRepository: LecturesRepository,
    @Inject(forwardRef(() => LectureAgentService))
    private readonly lectureAgentService: LectureAgentService,
    private readonly pubSubService: PubSubService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly lectureMetadataService: LectureMetadataService,
    private readonly usersService: UsersService,
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
    const update: any = {
      ...updateLectureDto,
    }

    if (updateLectureDto.topic) {
      update.topicEmbeddings = await this.embeddingsService.embeddings.embedQuery(updateLectureDto.topic)
    }

    return this.lecturesRepository.updateOne(authContext, { id }, {
      $set: {
        ...update,
      }
    });
  }

  async findOnePublic(authContext: AuthContextType, id: string) {
    return this.lecturesRepository.findOne(false, { id });
  }

  async findOnePending(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.lecturesRepository.findOnePending(authContext);
    return resource;
  }

  async find(authContext: AuthContextType, input: FindLecturesInputDto, pagination?: PaginationDto<Lecture>) {
    return this.lecturesRepository.find(authContext, input, pagination);
  }

  async findSearch(authContext: AuthContextType, input: SearchLecturesInputDto, pagination?: PaginationDto<Lecture>) {
    const { query } = input;
    const vector = await this.embeddingsService.embeddings.embedQuery(query);
    return this.lecturesRepository.findSearch(authContext, { queryVector: vector }, pagination);
  }

  async findAddedToLibrary(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    return this.lectureMetadataService.findLecturesAddedToLibrary(authContext, pagination);
  }

  async findRecentlyPlayed(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    return this.lectureMetadataService.findLecturesRecentlyPlayed(authContext, pagination);
  }

  async deleteOne(authContext: AuthContextType, id: string) {
    return this.lecturesRepository.deleteOne(authContext, { id });
  }

  async findRecommended(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    return this.lecturesRepository.findRecommended(authContext, pagination);
  }

  async callAgent(authContext: AuthContextType, lectureAgentInput: LectureAgentInputDto) {
    // Testing purposes
    // setTimeout(() => {
    //   const fn = async () => {
    //     const lecture = await this.lecturesRepository.findOne(authContext, { id: '686f5f4d02b4bcdeea1817af' });
    //     await this.pubSubService.publish<Lecture>(LectureCreatingTopic, {
    //       ...lecture,
    //       creationEvent: {
    //         name: 'DONE'
    //       },
    //     });
    //   }

    //   fn();
    // }, 5000);
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
                languageCode: lecture.languageCode,
                userId: lecture.userId,
                workspaceId: lecture.workspaceId,
                sections: lecture.sections.map(section => ({
                  title: section.title,
                  content: section.content,
                  annotations: section.annotations
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
      languageCode: lecture.languageCode,
      userId: lecture.userId,
      workspaceId: lecture.workspaceId,
      sections: lecture.sections.map(section => ({
        title: section.title,
        content: section.content,
        annotations: section.annotations
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

    const user = await this.usersService.findOne(null, lecture.userId, { throwErrorIfNotFound: false });
    const authContext = {
      user,
      workspaceId: lecture.workspaceId
    };

    await this.lectureMetadataService.addToLibrary(authContext, lecture.id);

    await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
  }
} 