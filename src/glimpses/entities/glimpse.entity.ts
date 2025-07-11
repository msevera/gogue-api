import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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
    required: true,
  })
  topicId: string;

  @Field(() => [String])
  @Prop({ type: [String] })
  previousContent: string[];
}

export const GlimpseEntity = SchemaFactory.createForClass(Glimpse);