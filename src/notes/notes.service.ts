import { Injectable } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { NoteCreatedTopic } from './topics/note-created.topic';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository, private pubSubService: PubSubService) { }

  async find(authContext: AuthContextType, pagination?: PaginationDto<Note>) {
    return this.notesRepository.find(authContext, {}, pagination);
  }

  async findOne(authContext: AuthContextType, id: string) {
    return this.notesRepository.findOne(authContext, { id });
  }

  async deleteOne(authContext: AuthContextType, id: string) {
    return this.notesRepository.deleteOne(authContext, { id });
  }

  async createOne(authContext: AuthContextType, createNoteDto: CreateNoteDto) {
    const note = await this.notesRepository.create(authContext, {
      ...createNoteDto,
      userId: authContext.user.id,
      workspaceId: authContext.workspaceId
    });
    this.pubSubService.publish(NoteCreatedTopic, note);
    return note;
  }
}
