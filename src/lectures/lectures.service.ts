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
import { NotificationsService } from 'src/notifications/notifications.service';
import { LectureCreatedNotification } from './notifications/lecture-created.notification';
import { LectureRecreatedNotification } from './notifications/lecture-recreated.notification';

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
    @Inject('KAFKA_PRODUCER') private client: ClientProxy,
    private readonly notificationsService: NotificationsService
  ) {
    super(lecturesRepository);
  }

  async createOne(authContext: AuthContextType, input: CreateLectureDto) {
    return this.lecturesRepository.create(authContext, {
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

  async findOnePublic(id: string) {
    return this.lecturesRepository.findOne(false, { id });
  }

  async findOnePending(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.lecturesRepository.findOnePending(authContext);
    return resource;
  }

  async findOnePendingShowNotification(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.lecturesRepository.findOnePendingShowNotification(authContext);
    return resource;
  }

  async setPendingLectureShowNotificationAsDone(authContext: AuthContextType, id: string) {
    const lecture = await this.lecturesRepository.findOne(authContext, { id });
    return this.lecturesRepository.updateOne(authContext, { id }, {
      creationEvent: {
        ...lecture.creationEvent,
        showNotification: false
      },
    });
  }

  async find(input: FindLecturesInputDto, pagination?: PaginationDto<Lecture>) {
    return this.lecturesRepository.find(false, input, pagination);
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
    const { input } = lectureAgentInput;
    const thread_id = `lectures-${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;

    let lecture = await this.lecturesRepository.create(authContext, {
      input,
      topic: '',
      title: '',
      emoji: '',
      sections: [],
      research: [],
      creationEvent: {
        name: 'INIT',
        showNotification: true
      },
    });

    try {
      await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
      const eventStream = await this.lectureAgentService.graph.streamEvents(
        {
          input
        },
        {
          configurable: {
            thread_id,
            authContext,
            lectureId: lecture.id,
            showNotification: true
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
                  content: section.content
                })),
                voiceInstructions: lecture.voiceInstructions
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
        content: section.content
      })),
      voiceInstructions: lecture.voiceInstructions
    });
  }

  async recreateLectureContent(authContext: AuthContextType, id: string) {
    const thread_id = `lectures-${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;
    let lecture = await this.lecturesRepository.findOne(authContext, { id });

    try {
      await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
      const eventStream = await this.lectureAgentService.graph.streamEvents(
        {
          input: lecture.input,
        },
        {
          configurable: {
            thread_id,
            authContext,
            lectureId: lecture.id,
            showNotification: false
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
            if (eventName === 'FINALIZING') {
              await this.client.emit<any, LectureCreatedServiceDto>('lecture.recreated', {
                id: lecture.id,
                topic: lecture.topic,
                title: lecture.title,
                emoji: lecture.emoji,
                languageCode: lecture.languageCode,
                userId: lecture.userId,
                workspaceId: lecture.workspaceId,
                sections: lecture.sections.map(section => ({
                  title: section.title,
                  content: section.content
                })),
                voiceInstructions: lecture.voiceInstructions
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

  async handleTTSCompleted(lectureTTSCompleted: LectureTTSCompletedServiceDto) {
    const { id, audio, aligners, image } = lectureTTSCompleted;
    const lecture = await this.lecturesRepository.updateOne(false, { id }, {
      audio,
      aligners,
      image,
      creationEvent: {
        name: 'DONE',
        showNotification: true
      },
    });

    const user = await this.usersService.findOne(null, lecture.userId, { throwErrorIfNotFound: false });
    const authContext = {
      user,
      workspaceId: lecture.workspaceId
    };

    await this.lectureMetadataService.addToLibrary(authContext, lecture.id);
    await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
    await this.notificationsService.sendNotification(LectureCreatedNotification, authContext, lecture);
  }

  async handleTTSRecreated(lectureTTSCompleted: LectureTTSCompletedServiceDto) {
    const { id, audio, aligners, image } = lectureTTSCompleted;
    const lecture = await this.lecturesRepository.updateOne(false, { id }, {
      audio,
      aligners,
      image,
      creationEvent: {
        name: 'DONE',
        showNotification: false
      },
    });

    const user = await this.usersService.findOne(null, lecture.userId, { throwErrorIfNotFound: false });
    const authContext = {
      user,
      workspaceId: lecture.workspaceId
    };

    await this.notificationsService.sendNotification(LectureRecreatedNotification, authContext, lecture);
  }

  async markAsReady(authContext: AuthContextType, id: string, state: string, showNotification: boolean) {
    const lecture = await this.lecturesRepository.updateOne(authContext, { id }, {
      creationEvent: {
        name: state,
        showNotification: showNotification
      },
    });
    await this.pubSubService.publish<Lecture>(LectureCreatingTopic, lecture);
    return lecture;
  }
} 