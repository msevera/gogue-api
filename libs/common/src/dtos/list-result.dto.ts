import { ObjectType, Field } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType('PageInfo')
export class PageInfoDto {
  @Field()
  hasPrev: boolean;

  @Field({ nullable: true })
  prev: number;

  @Field()
  hasNext: boolean;

  @Field({ nullable: true })
  next: number;
}

export function CreateCursor<T>(ItemType: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PageClass {
    @Field(() => [ItemType])
    items: T[];

    @Field(() => PageInfoDto, { nullable: true })
    pageInfo: PageInfoDto;
  }

  return PageClass;
}
