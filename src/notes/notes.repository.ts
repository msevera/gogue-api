import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './entities/note.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';

@Injectable()
export class NotesRepository extends CurrentAuthRepository<Note> {
  constructor(
    @InjectModel(Note.name)
    noteModel: Model<Note>
  ) {
    super(noteModel, Note);
  }


  async createWithId(authContext: AuthContextType, document: Partial<Note>) {
    const resource = await super.create(authContext, {
      _id: document.id,
      title: '',
      lectureId: '',
      timestamp: new Date()
    });

    return resource;

  }

} 