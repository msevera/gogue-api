import { IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('SetTimezone')
export class SetTimezoneDto {
  @IsString()
  @IsOptional() 
  @Field()
  timezone: string;
}
