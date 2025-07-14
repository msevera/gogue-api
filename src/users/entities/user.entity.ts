import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Workspace } from '../../../src/workspaces/enitities/workspace.entity';
import { CacheEntity } from '@app/common/types/cache-entity.type';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { BaseEntity } from '@app/common/types/base-entity.type';

@Schema({ _id: false })
@ObjectType()
export class WorkspaceItem {
  @Field(() => ID)
  @Prop({ required: true })
  workspaceId: string;

  @Field(() => Workspace)
  workspace?: Workspace
}

@Schema()
@ObjectType()
export class UserTopic extends BaseEntity {
  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String)
  @Prop({ required: true })
  nameId: string;

  @Field(() => String)
  @Prop({ required: true, enum: ['general', 'narrowed'] })
  type: string;

  @Field(() => String)
  @Prop({ required: true })
  overview: string;
}

@CustomSchema()
@ObjectType()
export class User extends CacheEntity {
  @Field()
  @Prop()
  firstName: string;

  @Field()
  @Prop()
  lastName: string;

  @Field()
  @Prop()
  email: string;

  @Field({ nullable: true })
  @Prop()
  phone: string;

  @Field({ nullable: true })
  @Prop()
  pfp: string;

  @Prop({ required: true, unique: true, index: true })
  uid: string;

  @Field(() => Role)
  @Prop({ required: true, type: String, enum: Role })
  role: Role;

  @Field(() => [WorkspaceItem])
  @Prop({ type: [WorkspaceItem] })
  workspaces: WorkspaceItem[];

  @Field(() => [UserTopic])
  @Prop({ type: [UserTopic], default: [] })
  topics?: UserTopic[];

  @Field(() => [Number])
  @Prop({ required: false })
  topicsEmbeddings?: number[];
}

export const UserEntity = SchemaFactory.createForClass(User);
