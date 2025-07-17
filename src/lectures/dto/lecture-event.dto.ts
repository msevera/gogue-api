import { Field, ObjectType } from '@nestjs/graphql';
import { Lecture } from '../entities/lecture.entity';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class LectureCreationEvent {
  @Field()
  @Prop({ enum: ['INIT', 'NORMALIZING_TOPIC', 'GENERATING_PLAN', 'GENERATING_CONTENT', 'GENERATING_OVERVIEW', 'GENERATING_CATEGORIES', 'FINALIZING', 'DONE'] })
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