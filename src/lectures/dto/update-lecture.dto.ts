import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class UpdateLectureCreationEventMessageDto {  
  title?: string;
  topic?: string;
  emoji?: string;  
}


class UpdateLectureCreationEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  showNotification?: boolean;
}

class UpdateLectureContentAnnotationDto {
  @IsNumber()
  @IsNotEmpty()
  startIndex: number;

  @IsNumber()
  @IsNotEmpty()
  endIndex: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateLectureSectionDto {  
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsArray()
  @IsOptional()
  annotations?: UpdateLectureContentAnnotationDto[];
}

class UpdateLectureCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateLectureDto {
  @IsString()
  @IsNotEmpty()
  topic?: string;

  @IsString()
  @IsNotEmpty()
  overview?: string;

  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsNotEmpty()
  emoji?: string;

  @IsString()
  @IsNotEmpty()
  languageCode?: string;

  @IsArray()
  @IsNotEmpty()
  sections?: UpdateLectureSectionDto[];  
  
  @IsNotEmpty()
  creationEvent: UpdateLectureCreationEventDto;

  categories?: UpdateLectureCategoryDto[];
} 