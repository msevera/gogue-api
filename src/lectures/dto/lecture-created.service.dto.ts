import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LectureSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class LectureCreatedServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  emoji?: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  workspaceId: string;
  
  @Type(() => LectureSectionDto)
  @IsNotEmpty()
  sections: LectureSectionDto[];
}