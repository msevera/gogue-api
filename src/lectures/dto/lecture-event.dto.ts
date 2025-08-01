import { Field, ObjectType } from '@nestjs/graphql';
import { Lecture } from '../entities/lecture.entity';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class LectureCreationEvent {
  @Field()
  @Prop({ enum: ['INIT', 'NORMALIZING_TOPIC', 'RESEARCHING_PLAN', 'RESEARCHING_CONTENT', 'COMPILING_CONTENT', 'GENERATING_CATEGORIES', 'FINALIZING', 'DONE'] })
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Prop({ default: false })
  showNotification?: boolean;
}

@ObjectType()
export class LectureCreationEventTopicData {
  @Field(() => Lecture)
  lecture: Lecture;

  @Field(() => LectureCreationEvent)
  event: LectureCreationEvent
}