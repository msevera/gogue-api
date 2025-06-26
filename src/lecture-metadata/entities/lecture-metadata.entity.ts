import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import mongoose from 'mongoose';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { LectureMetadataStatus } from '@app/common/dtos/lecture-matadata-status.enum.dto';


@CustomSchema()
@ObjectType()
export class LectureMetadata extends WorkspaceEntity {  
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
    ref: 'Lecture',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  lectureId: string;

  @Field(() => Number)
  @Prop({ default: 0 })
  notesCount?: number;  

  @Field(() => Number)
  @Prop({ default: 0 })
  playbackTimestamp?: number;

  @Field(() => LectureMetadataStatus)
  @Prop({ required: true, type: String, enum: LectureMetadataStatus, default: LectureMetadataStatus.NOT_STARTED })
  status?: LectureMetadataStatus;
}

export const LectureMetadataEntity = SchemaFactory.createForClass(LectureMetadata);