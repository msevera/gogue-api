import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@InputType('FindNoteMessagesInput')
export class FindNoteMessagesInputDto {
  @IsNotEmpty()
  @IsMongoId()
  @Field(() => ID)
  noteId: string;
}
