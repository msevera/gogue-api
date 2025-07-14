import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType('UsersTopicsAgentInput')
export class UsersTopicsAgentInputDto {
  @Field(() => String)
  @IsString()
  input: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  threadId: string;

  @Field(() => Boolean)
  @IsBoolean()
  @IsOptional()
  store: boolean;
}
