import { Field, ID } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Workspace } from 'src/workspaces/enitities/workspace.entity';

export class EntityBase {
  _id?: string;
  
  @Field(() => ID)
  id: string;
}

export class EntityCache extends EntityBase {
  __fromCache?: boolean;
}

export class EntityWorkspace extends EntityCache {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  workspaceId: string;

  @Field(() => Workspace)
  workspace?: Workspace;
}
