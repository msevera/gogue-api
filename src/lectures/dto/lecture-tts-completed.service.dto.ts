import { IsObject, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { Aligners, AudioPaths } from '../entities/lecture.entity';

export class LectureTTSCompletedServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsObject()
  @IsNotEmpty()
  audioPaths: AudioPaths;

  @IsObject()
  @IsNotEmpty()
  aligners: Aligners;
}