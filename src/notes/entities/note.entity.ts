import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import mongoose from 'mongoose';
import { Lecture } from 'src/lectures/entities/lecture.entity';

@CustomSchema()
@ObjectType()
export class Note extends WorkspaceEntity { 
  @Field(() => String)
  @Prop({ required: true })
  title: string;

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

  @Field(() => Lecture)
  lecture?: Lecture;

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

  @Field()
  @Prop({ required: true, type: Number })
  timestamp: number;
}

export const NoteEntity = SchemaFactory.createForClass(Note); 