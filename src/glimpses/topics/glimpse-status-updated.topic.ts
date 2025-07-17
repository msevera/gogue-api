import { TopicType } from '../../pubsub/pubsub.service';
import { GlimpseStatus } from '../entities/glimpse-status.entity';


const type = 'glimpseStatusUpdated';
export const GlimpseStatusUpdatedTopic: TopicType<GlimpseStatus> = {
  type,
  typeFunc: () => GlimpseStatus,
  builder: (glimpseStatus: GlimpseStatus) => {    
    const userAuthContext = { userId: glimpseStatus.userId, workspaceId: glimpseStatus.workspaceId };  
    return {
      type,
      data: glimpseStatus,
      authContexts: [userAuthContext]
    }
  }
}