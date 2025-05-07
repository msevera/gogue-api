import { UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { SerializationInterceptor } from './serializer.interceptor';

export function Serialize(classConstructor: ClassConstructor<unknown>) {
  return UseInterceptors(new SerializationInterceptor(classConstructor));
}