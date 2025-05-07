import { Prop } from '@nestjs/mongoose';
import { CacheEntity } from './cache-entity.type';
import mongoose from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Workspace } from 'src/workspaces/enitities/workspace.entity';

@ObjectType({ isAbstract: true })
export class WorkspaceEntity extends CacheEntity {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true 
  })
  workspaceId: string;

  @Field(() => Workspace)
  workspace?: Workspace;
}