import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  id: string;

  workspaceId?: string;

  userId?: string;

  __fromCache?: boolean;
}
