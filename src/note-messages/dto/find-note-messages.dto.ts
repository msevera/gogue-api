import { IsMongoId, IsNotEmpty } from 'class-validator';

export class FindNoteMessagesDto {
  @IsNotEmpty()
  @IsMongoId()
  lectureId: string;
}
