import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLectureSectionDto {  
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  content?: string;
}

export class CreateLectureDto {
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  emoji: string;

  @IsArray()
  @IsNotEmpty()
  sections: CreateLectureSectionDto[];  
} 