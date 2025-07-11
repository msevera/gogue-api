import { IsMongoId, IsString } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType('RemoveTopicInput')
export class RemoveTopicDto {
  @Field(() => ID)
  @IsMongoId()
  @IsString()
  topicId: string;
}
