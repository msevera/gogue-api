import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lecture, LectureEntity } from './entities/lecture.entity';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repository';
import { LectureSectionResolver, LecturesResolver } from './lectures.resolver';
import { UsersModule } from 'src/users/users.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { LectureAgentModule } from 'src/lecture-agent/lecture-agent.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { LectureTTSController } from './lectures.controller';

@Module({
  imports: [
    forwardRef(() => LectureAgentModule),
    PubSubModule,
    MongooseModule.forFeature([{ name: Lecture.name, schema: LectureEntity }]),
    UsersModule,
    KafkaModule,    
  ],
  controllers: [LectureTTSController],
  providers: [LecturesResolver, LectureSectionResolver, LecturesService, LecturesRepository],
  exports: [MongooseModule, LecturesService, LecturesRepository]
})
export class LecturesModule {} 