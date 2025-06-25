import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { REQUEST_USER_KEY, REQUEST_WORKSPACE_ID_KEY } from '../constants/auth.constant';
import { User } from '../../../../src/users/entities/user.entity';

export type AuthContextType = {
  user: User;
  workspaceId: string;
}

export type AuthContextPubSubType = {
  userId: string;
  workspaceId: string;
}

export type AuthContextNotificationType = {
  userId: string;
  workspaceId: string;
}

export const AuthContext = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = GqlExecutionContext.create(context).getContext().req;
    return {
      user: request[REQUEST_USER_KEY],
      workspaceId: request[REQUEST_WORKSPACE_ID_KEY],
    };
  },
);
