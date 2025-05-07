import { Subscription, ReturnTypeFunc, SubscriptionOptions } from '@nestjs/graphql';
import { TopicBuilderType, TopicType } from 'src/pubsub/pubsub.service';

export function CustomSubscription<R, T>(
  topic: TopicType<T>,
  filter?: (resolver, payload: T, variables: any, context: any) => boolean | Promise<boolean>,
  resolve?: (resolver, payload: T, variables: any, context: any) => any | Promise<any>
) {
  return Subscription(topic.typeFunc, {
    name: topic.type,
    filter(this: R, payload: TopicBuilderType<any>, variables, context) {      
      if (payload.authContexts.length === 0) {
        return false;
      }

      const { authContext } = context.req.extra;
      const isAuthorized = payload.authContexts.some(auth => auth.userId === authContext.user.id && auth.workspaceId === authContext.workspaceId);
      if (!isAuthorized) {
        return false;
      }

      const filterResult = filter?.(this, payload.data, variables, context);

      return typeof filterResult !== 'undefined' ? filterResult : true;
    },
    resolve(this: R, payload: TopicBuilderType<any>, variables, context) {
      return resolve?.(this, payload.data, variables, context) || payload.data;
    }
  });
}
