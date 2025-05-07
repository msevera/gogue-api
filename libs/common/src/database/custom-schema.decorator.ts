import { Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export function CustomSchema(options?: mongoose.SchemaOptions) {
  return Schema({
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: 'version',
    ...options,
  });
}
