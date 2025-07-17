import { ObjectType } from '@nestjs/graphql';
import { CreateCursor } from '@app/common/dtos/list-result.dto';
import { Glimpse } from '../entities/glimpse.entity';

@ObjectType('GlimpsesCursor')
export class GlimpsesCursorDto extends CreateCursor(Glimpse) {}
