import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { CacheEntity } from '@app/common/types/cache-entity.type';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@CustomSchema()
@ObjectType()
export class Workspace extends CacheEntity {
  @Field(() => ID)
  @Prop({ required: true })
  name: string;

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

  @Field(() => User)
  user?: User;
}

export const WorkspaceEntity = SchemaFactory.createForClass(Workspace);