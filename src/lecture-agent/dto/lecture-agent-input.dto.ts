import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateLectureInput')
export class LectureAgentInputDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsOptional()
  lectureId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  sourceId?: string;
}
