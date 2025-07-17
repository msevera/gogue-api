import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

class GlimpseContent {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Glimpse',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  glimpseId: string;


  @Field(() => String)
  @Prop({ required: true })
  content: string;
}

@CustomSchema()
@ObjectType()
export class GlimpseCheckpoint extends WorkspaceEntity {
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

  @Field(() => [GlimpseContent])
  @Prop({ type: [GlimpseContent] })
  previousContent: GlimpseContent[];
}

export const GlimpseCheckpointEntity = SchemaFactory.createForClass(GlimpseCheckpoint);