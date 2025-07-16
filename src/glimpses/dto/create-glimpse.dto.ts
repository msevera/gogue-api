import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GlimpseAnnotation } from '../entities/glimpse.entity';

export class CreateGlimpseDto {
  @IsString()
  @IsNotEmpty()
  topicId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  annotations?: GlimpseAnnotation[];
} 