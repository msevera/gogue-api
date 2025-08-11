import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('MatchedSourcesInput')
export class MatchedSourcesInputDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  input: string;
}
