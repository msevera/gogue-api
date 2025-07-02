import { ObjectType } from '@nestjs/graphql';
import { CreateCursor } from '@app/common/dtos/list-result.dto';
import { NoteMessage } from '../entities/note-message.entity';

@ObjectType('NoteMessagesCursor')
export class NoteMessagesCursorDto extends CreateCursor(NoteMessage) {}
