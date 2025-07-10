import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../../src/users/entities/user.entity';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import mongoose from 'mongoose';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { LectureCreationEvent } from '../dto/lecture-event.dto';
import { LectureMetadata } from '../../../src/lecture-metadata/entities/lecture-metadata.entity';
import { Category } from '../../../src/categories/entities/category.entity';


@Schema({ _id: false })
@ObjectType()
export class LectureSectionAnnotation {
  @Field(() => Number)
  @Prop({ required: true })
  startIndex: number;

  @Field(() => Number)
  @Prop({ required: true })
  endIndex: number;

  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String)
  @Prop({ required: true })
  type: string;

  @Field(() => String)
  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
@ObjectType()
export class LectureSection {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  content?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;

  @Field(() => Boolean)
  hasContent?: boolean;

  @Field(() => [LectureSectionAnnotation], { nullable: true })
  @Prop({ required: false, type: [LectureSectionAnnotation] })
  annotations?: LectureSectionAnnotation[];
}

@Schema({ _id: false })
@ObjectType()
export class Audio {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  stream?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  wav?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  folder?: string;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  duration?: number;

  @Field(() => [Number], { nullable: true })
  @Prop({ required: false })
  bars?: number[];
}

@Schema({ _id: false })
@ObjectType()
export class Aligners {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  mfa?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  text?: string;
}

@Schema({ _id: false })
@ObjectType()
export class Image {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  prompt?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  webp?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  folder?: string;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  width?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  height?: number;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  color?: string;
}

@Schema({ _id: false })
@ObjectType()
export class LectureCategory {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  categoryId: string;

  @Field(() => Category)
  category?: Category;
}

@CustomSchema()
@ObjectType()
export class Lecture extends WorkspaceEntity {
  @Field(() => Number)
  @Prop({ required: true })
  duration: number;

  @Field(() => String)
  @Prop({ required: true })
  input: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  topic?: string;

  @Field(() => [Number], { nullable: true })
  @Prop({ required: false })
  topicEmbeddings?: number[];

  @Field(() => [LectureCategory], { nullable: true })
  @Prop({ required: false, type: [LectureCategory] })
  categories?: LectureCategory[];

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  title?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  emoji?: string;

  @Field(() => User)
  user?: User;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  userId: string;

  @Field(() => [LectureSection])
  @Prop({ type: [LectureSection] })
  sections: LectureSection[];

  @Field(() => LectureCreationEvent, { nullable: true })
  @Prop({ type: LectureCreationEvent })
  creationEvent?: LectureCreationEvent;

  @Field(() => Audio, { nullable: true })
  @Prop({ required: false, type: Audio })
  audio?: Audio;

  @Field(() => Aligners, { nullable: true })
  @Prop({ required: false, type: Aligners })
  aligners?: Aligners;

  @Field(() => LectureMetadata, { nullable: true })
  metadata?: LectureMetadata;

  @Field(() => Image, { nullable: true })
  @Prop({ required: false, type: Image })
  image?: Image;

  @Field(() => Boolean)
  @Prop({ required: true, default: true })
  isPublic?: boolean;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: 'en' })
  languageCode?: string;
}

export const LectureEntity = SchemaFactory.createForClass(Lecture);

// vector index
// topic_embeddings_cosine
// {
//   "fields": [{
//     "type": "vector",
//     "path": "topicEmbeddings",
//     "numDimensions": 1536,
//     "similarity": "cosine"
//   }]
// }