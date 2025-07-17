import { NotificationType } from "src/notifications/notifications.service";
import { Lecture } from '../entities/lecture.entity';

export const LectureCreatedNotification: NotificationType<Lecture> = {
  type: 'lecture_created',
  builder: (authContext, data: Lecture) => {
    return {
      type: 'lecture_created',
      authContexts: [{
        userId: authContext.user.id,
        workspaceId: authContext.workspaceId
      }],
      title: 'Gogue',
      message: `${data.title} lecture is ready`,
      url: `/lectures/${data.id}`,
      showWhenOnUrl: true,
      interruptionLevel: 'active',
      badgeType: 'None'     
    }
  }
}