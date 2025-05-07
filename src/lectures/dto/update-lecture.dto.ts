import { IsArray, IsNotEmpty, IsString } from 'class-validator';

class UpdateLectureCreationEventMessageDto {  
  title?: string;
  topic?: string;
  emoji?: string;  
}


class UpdateLectureCreationEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  message?: UpdateLectureCreationEventMessageDto;
}

export class UpdateLectureSectionDto {  
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateLectureDto {
  @IsString()
  @IsNotEmpty()
  topic?: string;

  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsNotEmpty()
  emoji?: string;

  @IsArray()
  @IsNotEmpty()
  sections?: UpdateLectureSectionDto[];  
  
  @IsNotEmpty()
  creationEvent: UpdateLectureCreationEventDto;
} 