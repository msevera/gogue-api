import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindLecturesInputDto {
  @IsString()
  @IsOptional()  
  creationEventName?: string;
}
