import { IsNumber, IsObject, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { Aligners, Audio } from '../entities/lecture.entity';

export class LectureTTSCompletedServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsObject()
  @IsNotEmpty()
  audio: Audio;

  @IsObject()
  @IsNotEmpty()
  aligners: Aligners;
}