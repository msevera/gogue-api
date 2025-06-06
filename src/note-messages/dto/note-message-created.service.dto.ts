import { IsArray, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';


class NoteMessage {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;
}

export class NoteMessageCreatedServiceDto {
  @IsMongoId()
  @IsNotEmpty()
  lectureId: string;

  @IsMongoId()
  @IsNotEmpty()
  noteId: string;

  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsNotEmpty()
  noteTimestamp: number;

  @IsArray()
  @IsNotEmpty()
  message: NoteMessage;
}