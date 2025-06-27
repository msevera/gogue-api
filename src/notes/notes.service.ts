import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { CreateNoteInputDto } from './dto/create-note.dto';
import { LecturesService } from '../lectures/lectures.service';
import { FindNotesInputDto } from './dto/find-notes.dto';
import { AbstractService } from '@app/common/services/abstract.service';
import { PubSubService } from '../pubsub/pubsub.service';
import { NoteCreatedTopic } from './topics/note-created.topic';
import { LectureMetadataService } from '../lecture-metadata/lecture-metadata.service';
import { NoteMessagesService } from '../note-messages/note-messages.service';
import { ClientProxy } from '@nestjs/microservices';
import { NoteDeletedServiceDto } from './dto/note-deleted-service.dto';

@Injectable()
export class NotesService extends AbstractService<Note> {
  constructor(
    @Inject(forwardRef(() => NoteMessagesService))
    private readonly noteMessagesService: NoteMessagesService,
    private readonly notesRepository: NotesRepository,
    private readonly lecturesService: LecturesService,
    private readonly pubSubService: PubSubService,
    private readonly lectureMetadataService: LectureMetadataService,    
    @Inject('KAFKA_PRODUCER') private client: ClientProxy
  ) {
    super(notesRepository);
  }

  async find(authContext: AuthContextType, input: FindNotesInputDto, pagination?: PaginationDto<Note>) {
    return this.notesRepository.find(authContext, input, pagination);
  }

  async deleteOne(authContext: AuthContextType, id: string) {
    const noteToRemove = await this.notesRepository.findOne(authContext, { id });
    await this.noteMessagesService.deleteMessages(authContext, id);
    const resource = await this.notesRepository.deleteOne(authContext, { id });
    await this.lectureMetadataService.removeNote(authContext, noteToRemove.lectureId);
    await this.client.emit<any, NoteDeletedServiceDto>('note.deleted', {
      id
    });

    return resource;
  }

  async createOne(authContext: AuthContextType, createNoteDto: CreateNoteInputDto) {
    const lecture = await this.lecturesService.findOne(false, createNoteDto.lectureId);

    const mfa = JSON.parse(lecture.aligners.mfa);
    const mfaSentence = mfa.find(item => item.is_sentence_start && createNoteDto.timestamp >= item.sentence.start_time && createNoteDto.timestamp < item.sentence.end_time);
    const text = lecture.aligners.text.slice(mfaSentence.sentence.start_offset, mfaSentence.sentence.end_offset);

    const note = await this.notesRepository.createWithId(authContext, {
      id: createNoteDto.id,
      title: text,
      lectureId: createNoteDto.lectureId,
      timestamp: createNoteDto.timestamp,
    });

    await this.lectureMetadataService.addNote(authContext, createNoteDto.lectureId);

    await this.pubSubService.publish<Note>(NoteCreatedTopic, note);

    return note;
  }
}
