import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsDate, IsOptional, IsNumber } from 'class-validator';

@InputType('CreateNoteInput')
export class CreateNoteInputDto {
  @IsMongoId()
  @IsOptional()
  @Field()
  id?: string;

  @IsNotEmpty()
  @IsMongoId()
  @Field()
  lectureId: string;

  @IsNumber()
  @IsNotEmpty()
  @Field()
  timestamp: number;
}
