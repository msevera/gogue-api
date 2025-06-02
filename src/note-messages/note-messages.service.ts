import { Injectable } from '@nestjs/common';
import { NoteMessagesRepository } from './note-messages.repository';
import { NoteMessage } from './entities/note-message.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { FindNoteMessagesInputDto } from './dto/find-note-messages.dto';
import { NoteMessageCreatedServiceDto } from './dto/note-message-created.service.dto';
import { NotesService } from 'src/notes/notes.service';
import { AbstractService } from '@app/common/services/abstract.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NoteMessagesService extends AbstractService<NoteMessage> {
  constructor(
    private readonly noteMessagesRepository: NoteMessagesRepository,
    private readonly notesService: NotesService,
    private readonly usersService: UsersService) {
    super(noteMessagesRepository);
  }

  async find(authContext: AuthContextType, input: FindNoteMessagesInputDto, pagination?: PaginationDto<NoteMessage>) {
    return this.noteMessagesRepository.find(authContext, input, pagination);
  }

  async handleNoteMessageCreated(input: NoteMessageCreatedServiceDto) {
    const user = await this.usersService.findOne(null, input.userId, { throwErrorIfNotFound: false });
    const authContext = {
      user,
      workspaceId: input.workspaceId
    };

    let note = await this.notesService.findOne(authContext, input.noteId, { throwErrorIfNotFound: false });
    if (!note) {
      note = await this.notesService.createOne(authContext, {
        id: input.noteId,
        lectureId: input.lectureId,
        timestamp: new Date(input.noteTimestamp)
      });
    }

    const noteMessages = input.noteMessages.map(noteMessage => ({
      ...noteMessage,
      noteId: note.id,
      lectureId: note.lectureId,
      timestamp: new Date(noteMessage.timestamp)
    }));

    return this.noteMessagesRepository.createMany(authContext, noteMessages);
  }
}
