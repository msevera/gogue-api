import { Injectable } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { CreateNoteInputDto } from './dto/create-note.dto';
import { LecturesService } from 'src/lectures/lectures.service';
import { FindNotesInputDto } from './dto/find-notes.dto';
import { AbstractService } from '@app/common/services/abstract.service';

@Injectable()
export class NotesService extends AbstractService<Note> {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly lecturesService: LecturesService
  ) {
    super(notesRepository);
  }

  async find(authContext: AuthContextType, input: FindNotesInputDto, pagination?: PaginationDto<Note>) {
    return this.notesRepository.find(authContext, input, pagination);
  }

  async deleteOne(authContext: AuthContextType, id: string) {
    return this.notesRepository.deleteOne(authContext, { id });
  }

  async createOne(authContext: AuthContextType, createNoteDto: CreateNoteInputDto) {
    const lecture = await this.lecturesService.findOne(authContext, createNoteDto.lectureId);

    const mfa = JSON.parse(lecture.aligners.mfa);
    const mfaSentence = mfa.find(item => item.is_sentence_start && createNoteDto.timestamp >= item.sentence.start_time && createNoteDto.timestamp < item.sentence.end_time);
    const text = lecture.aligners.text.slice(mfaSentence.sentence.start_index, mfaSentence.sentence.end_index);

    const note = await this.notesRepository.createWithId(authContext, {
      id: createNoteDto.id,
      title: text,
      lectureId: createNoteDto.lectureId,
      timestamp: createNoteDto.timestamp,
    });

    return note;
  }
}
