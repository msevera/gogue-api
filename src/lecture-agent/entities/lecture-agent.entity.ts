import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LectureAgent {
  @Field(() => String)  
  config: string
}