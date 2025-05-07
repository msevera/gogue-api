import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './entities/note.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';

@Injectable()
export class NotesRepository extends CurrentAuthRepository<Note> {
  constructor(
    @InjectModel(Note.name)
    noteModel: Model<Note>
  ) {
    super(noteModel, Note);
  }
} 