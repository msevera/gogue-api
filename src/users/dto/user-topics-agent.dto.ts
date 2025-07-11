import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType('UsersTopicsAgentInput')
export class UsersTopicsAgentInputDto {
  @Field(() => String)
  @IsString()
  input: string;
}
