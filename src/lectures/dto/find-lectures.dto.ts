import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('FindLecturesInput')
export class FindLecturesInputDto {
  @IsString()
  @IsOptional()
  creationEventName?: string;

  @IsMongoId()
  @IsOptional()
  @Field(() => ID, { nullable: true })
  skipUserId?: string
}
