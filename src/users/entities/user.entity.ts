import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Workspace } from '../../../src/workspaces/enitities/workspace.entity';
import { CacheEntity } from '@app/common/types/cache-entity.type';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';

@Schema({ _id: false })
@ObjectType()
export class WorkspaceItem {
  @Field(() => ID)
  @Prop({ required: true })
  workspaceId: string;

  @Field(() => Workspace)
  workspace?: Workspace
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
}

export const UserEntity = SchemaFactory.createForClass(User);
