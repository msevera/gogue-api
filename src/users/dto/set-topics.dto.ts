import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';

export class UserTopic {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  overview: string;
}

@InputType('SetTopicsInput')
export class SetTopicsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTopic)
  topics: UserTopic[];
}
