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

@Injectable()
export class LecturesService {
  constructor(
    private readonly lecturesRepository: LecturesRepository,
    @Inject(forwardRef(() => LectureAgentService))
    private readonly lectureAgentService: LectureAgentService,
    private readonly pubSubService: PubSubService
  ) { }

  async createOne(authContext: AuthContextType, input: CreateLectureDto) {
    return this.lecturesRepository.create(authContext, {
      duration: input.duration,
      input: input.input,
      topic: input.topic,
      title: input.title,
      emoji: input.emoji,
      sections: input.sections,
      userId: authContext.user.id,
      workspaceId: authContext.workspaceId
    });
  }

  async updateOne(authContext: AuthContextType, id: string, updateLectureDto: UpdateLectureDto) {
    return this.lecturesRepository.updateOne(authContext, { id }, {
      $set: updateLectureDto
    });
  }

  async setCheckpoint(authContext: AuthContextType, id: string, checkpoint: string) {
    return this.lecturesRepository.updateOne(authContext, { id }, {
      checkpoint
    });
  }

  async find(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    return this.lecturesRepository.find(authContext, {}, pagination);
  }

  async findOne(authContext: AuthContextType, id: string) {
    return this.lecturesRepository.findOne(authContext, { id });
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
      userId: authContext.user.id,
      workspaceId: authContext.workspaceId,
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
} 