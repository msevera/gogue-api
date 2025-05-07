import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsMongoId, IsArray, ArrayMinSize, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  lectureId: string;
}
