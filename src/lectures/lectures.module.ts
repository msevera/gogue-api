import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lecture, LectureEntity } from './entities/lecture.entity';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repository';
import { LectureCategoryResolver, LectureResearchSectionResolver, LectureSectionResolver, LecturesResolver } from './lectures.resolver';
import { UsersModule } from '../users/users.module';
import { PubSubModule } from '../pubsub/pubsub.module';
import { LectureAgentModule } from '../lecture-agent/lecture-agent.module';
import { KafkaModule } from '../kafka/kafka.module';
import { LectureTTSController } from './lectures.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { CategoriesModule } from '../categories/categories.module';
import { LectureMetadataModule } from 'src/lecture-metadata/lecture-metadata.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => LectureAgentModule),
    PubSubModule,
    MongooseModule.forFeature([{ name: Lecture.name, schema: LectureEntity }]),
    UsersModule,
    KafkaModule,   
    EmbeddingsModule,
    CategoriesModule,
    LectureMetadataModule,
    NotificationsModule
  ],
  controllers: [LectureTTSController],
  providers: [LecturesResolver, LectureSectionResolver, LectureCategoryResolver, LecturesService, LecturesRepository, LectureResearchSectionResolver],
  exports: [MongooseModule, LecturesService, LecturesRepository]
})
export class LecturesModule {} 