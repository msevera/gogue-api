import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@InputType('FindNotesInput')
export class FindNotesInputDto {
  @IsNotEmpty()
  @IsMongoId()
  @Field(() => ID)
  lectureId: string;
}
