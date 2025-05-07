import { TopicType } from '../../pubsub/pubsub.service';
import { Note } from '../entities/note.entity';

const type = 'noteCreated';
export const NoteCreatedTopic: TopicType<Note> = {
  type,
  typeFunc: () => Note,
  builder: (note: Note) => {
    const userAuthContext = { userId: note.userId, workspaceId: note.workspaceId };
  
    return {
      type,
      data: note,
      authContexts: [userAuthContext]
    }
  }
}