import { IsString, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('SetProfileInput')
export class SetProfileDto {
  @IsString()
  @MaxLength(20)
  @Field()
  firstName: string;

  @IsString()
  @MaxLength(20)
  @Field()
  lastName: string;
}
