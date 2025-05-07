import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { SortOrder } from '@app/common/database/options';

registerEnumType(SortOrder, { 
  name: 'SortOrder',
});

@InputType('SortInput')
export class SortDto<T> {
  @Field(() => String)
  by: keyof T | '_id';

  @Field(() => SortOrder)
  order: SortOrder;
}

@InputType('PaginationInput')
export class PaginationDto<T> {
  @Field({ nullable: true })
  next: number;

  @Field({ nullable: true })
  prev: number;

  @Field({ nullable: true })
  limit: number;

  @Field(() => [SortDto], { nullable: true })
  sort: SortDto<T>[];
}
