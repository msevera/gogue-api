import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class BaseEntity {
  _id?: string;
  
  @Field(() => ID)
  id: string;
}