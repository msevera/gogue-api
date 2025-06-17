import { IsString, IsNotEmpty } from 'class-validator';

export class NoteDeletedServiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}