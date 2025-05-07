import { TopicType } from '../../pubsub/pubsub.service';
import { LectureCreationEventTopicData, LectureCreationEvent } from '../dto/lecture-event.dto';
import { Lecture } from '../entities/lecture.entity';

const type = 'lectureCreating';
export const LectureCreatingTopic: TopicType<Lecture> = {
  type,
  typeFunc: () => Lecture,
  builder: (lecture: Lecture) => {    
    const userAuthContext = { userId: lecture.userId, workspaceId: lecture.workspaceId };
  
    return {
      type,
      data: lecture,
      authContexts: [userAuthContext]
    }
  }
}