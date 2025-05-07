import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DATA_LOADERS_KEY } from '../constants/auth.constant';

export const DataLoaders = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[DATA_LOADERS_KEY];
  },
);
