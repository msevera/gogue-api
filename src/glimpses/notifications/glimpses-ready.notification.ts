import { NotificationType } from "src/notifications/notifications.service";

export const GlimpsesReadyNotification: NotificationType<null> = {
  type: 'glimpses_ready',
  builder: (authContext, data: null) => {
    return {
      type: 'glimpses_ready',
      authContexts: [{
        userId: authContext.user.id,
        workspaceId: authContext.workspaceId
      }],
      title: 'Check your glimpses',
      message: 'Glimpses are ready',
      url: '/glimpses',
      showWhenOnUrl: true,
      interruptionLevel: 'passive',
      badgeType: 'SetTo',
      badgeCount: 1
    }
  }
}