import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@CustomSchema()
@ObjectType()
export class GlimpseStatus extends WorkspaceEntity {
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

  @Field(() => String)
  @Prop({ required: true, enum: ['NEW', 'PREPARING', 'OLD', 'NOT_READY'] })
  status: string;
}

export const GlimpseStatusEntity = SchemaFactory.createForClass(GlimpseStatus);