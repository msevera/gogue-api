import {
  SSE_METADATA,
  PATH_METADATA,
  METHOD_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';

export const SsePost = (path: string) => {
  return (target, key, descriptor) => {
    path = path && path.length ? path : '/';
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(
      METHOD_METADATA,
      RequestMethod.POST,
      descriptor.value,
    );
    Reflect.defineMetadata(SSE_METADATA, true, descriptor.value);
    return descriptor;
  };
};
