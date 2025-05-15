import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class LectureTTSCompletedServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  audioPath: string;

  @IsString()
  @IsNotEmpty()
  mfa: string;

  @IsString()
  @IsNotEmpty()
  aenas: string;
}