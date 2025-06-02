import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

@InputType('CreateNoteInput')
export class CreateNoteInputDto {
  @IsMongoId()
  @IsOptional()
  @Field()
  id: string;

  @IsNotEmpty()
  @IsMongoId()
  @Field()
  lectureId: string;

  @IsDate()
  @IsNotEmpty()
  @Field()
  timestamp: Date;
}
