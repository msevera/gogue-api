import { ObjectType } from '@nestjs/graphql';
import { CreateCursor } from '@app/common/dtos/list-result.dto';
import { Note } from '../entities/note.entity';

@ObjectType('NotesCursor')
export class NotesCursorDto extends CreateCursor(Note) {}
