import { ObjectType } from '@nestjs/graphql';
import { CreateCursor } from '@app/common/dtos/list-result.dto';
import { Source } from '../entities/source.entity';

@ObjectType('SourcesCursor')
export class SourcesCursorDto extends CreateCursor(Source) {}
