import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsDate, IsOptional, IsNumber } from 'class-validator';

@InputType('CreateNoteInput')
export class CreateNoteInputDto {
  @IsMongoId()
  @IsOptional()
  @Field({ nullable: true })
  id?: string;

  @IsNotEmpty()
  @IsMongoId()
  @Field(() => ID)
  lectureId: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Float)
  timestamp: number;
}
