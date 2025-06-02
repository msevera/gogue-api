import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

@InputType('FindNotesInput')
export class FindNotesInputDto {
  @IsNotEmpty()
  @IsMongoId()
  @Field()
  lectureId: string;
}
