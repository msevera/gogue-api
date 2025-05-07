import { Field, ObjectType } from '@nestjs/graphql';
import { Lecture } from '../entities/lecture.entity';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class LectureCreationEvent {
  @Field()
  @Prop()
  name: string;
}

@ObjectType()
export class LectureCreationEventTopicData {
  @Field(() => Lecture)
  lecture: Lecture;

  @Field(() => LectureCreationEvent)
  event: LectureCreationEvent
}