import { Field, ID, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('SearchLecturesInput')
export class SearchLecturesInputDto {  
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  query?: string;

  @IsArray()
  @IsOptional()  
  queryVector?: number[];
}
