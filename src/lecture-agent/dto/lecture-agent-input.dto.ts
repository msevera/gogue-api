import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType('CreateLectureInput')
export class LectureAgentInputDto {
  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  input: string;
}
