import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('FindLecturesInput')
export class FindLecturesInputDto {
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  addedToLibrary?: boolean;

  @IsString()
  @IsOptional()  
  creationEventName?: string;
}
