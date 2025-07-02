import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';
import { Note } from '../entities/note.entity';
import { NotesRepository } from '../notes.repository';

export class NoteDataLoader extends AbstractDataLoader<Note> {
  constructor(private readonly notesRepository: NotesRepository) {
    super(notesRepository);
  }
}
