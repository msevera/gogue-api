import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NoteAgent {
  @Field(() => String)  
  config: string
}