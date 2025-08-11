import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('CreateSource')
export class CreateSourceDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  internalDescription: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  overview: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  categories: string[];

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  authors: string[];
} 