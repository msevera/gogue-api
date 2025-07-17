import { NotificationType } from "src/notifications/notifications.service";
import { Glimpse } from "../entities/glimpse.entity";
const removeMd = require('remove-markdown');

export const GlimpsesReadyNotification: NotificationType<Glimpse> = {
  type: 'glimpses_ready',
  builder: (authContext, data: Glimpse) => {
    return {
      type: 'glimpses_ready',
      authContexts: [{
        userId: authContext.user.id,
        workspaceId: authContext.workspaceId
      }],
      title: 'Gogue',
      message: removeMd(data.content),
      url: '/glimpses',
      showWhenOnUrl: true,
      interruptionLevel: 'active',
      badgeType: 'None'     
    }
  }
}