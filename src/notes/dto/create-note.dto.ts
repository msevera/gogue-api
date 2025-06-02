import { IsMongoId, IsNotEmpty, IsDate } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsMongoId()
  lectureId: string;

  @IsDate()
  @IsNotEmpty()
  timestamp: Date;
}
