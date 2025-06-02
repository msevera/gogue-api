import { Injectable } from '@nestjs/common';
import { NoteMessagesRepository } from './note-messages.repository';
import { NoteMessage } from './entities/note-message.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { FindNoteMessagesDto } from './dto/find-note-messages.dto';

@Injectable()
export class NoteMessagesService {
  constructor(private readonly noteMessagesRepository: NoteMessagesRepository) { }

  async find(authContext: AuthContextType, input: FindNoteMessagesDto, pagination?: PaginationDto<NoteMessage>) {
    return this.noteMessagesRepository.find(authContext, input, pagination);
  }
}
