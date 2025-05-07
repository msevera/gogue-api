import { ObjectType } from '@nestjs/graphql';
import { Lecture } from '../entities/lecture.entity';
import { CreateCursor } from '@app/common/dtos/list-result.dto';

@ObjectType('LecturesCursor')
export class LecturesCursorDto extends CreateCursor(Lecture) {}
