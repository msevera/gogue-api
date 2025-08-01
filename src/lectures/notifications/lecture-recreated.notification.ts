import { NotificationType } from "src/notifications/notifications.service";
import { Lecture } from '../entities/lecture.entity';

export const LectureRecreatedNotification: NotificationType<Lecture> = {
  type: 'lecture_recreated',
  builder: (authContext, data: Lecture) => {
    return {
      type: 'lecture_recreated',
      authContexts: [{
        userId: authContext.user.id,
        workspaceId: authContext.workspaceId
      }],
      title: 'Gogue',
      message: `${data.title} lecture is updated. Check it out!`,
      url: `/lectures/${data.id}`,
      showWhenOnUrl: true,
      interruptionLevel: 'active',
      badgeType: 'None'     
    }
  }
}