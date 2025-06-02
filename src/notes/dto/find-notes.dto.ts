import { IsMongoId, IsNotEmpty } from 'class-validator';

export class FindNotesDto {
  @IsNotEmpty()
  @IsMongoId()
  lectureId: string;
}
