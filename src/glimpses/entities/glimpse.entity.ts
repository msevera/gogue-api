import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
@ObjectType()
export class GlimpseAnnotation {
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

@CustomSchema()
@ObjectType()
export class Glimpse extends WorkspaceEntity {
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

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true
  })
  topicId: string;

  @Field(() => String)
  @Prop({ required: true })
  content: string;

  @Field(() => [GlimpseAnnotation], { nullable: true })
  @Prop({ required: false, type: [GlimpseAnnotation] })
  annotations?: GlimpseAnnotation[];

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  viewed: boolean;
}

export const GlimpseEntity = SchemaFactory.createForClass(Glimpse);