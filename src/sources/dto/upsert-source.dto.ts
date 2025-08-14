import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('UpsertSourceSection')
export class UpsertSourceSectionDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  overview?: string;
}

@InputType('UpsertSource')
export class UpsertSourceDto {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  internalDescription?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  overview?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  authors?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  topic?: string;

  @Field(() => [UpsertSourceSectionDto], { nullable: true })
  @IsArray()
  @IsOptional()
  sections?: UpsertSourceSectionDto[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  keyInsights?: string[];  

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  keyTakeaways?: string[];
} 