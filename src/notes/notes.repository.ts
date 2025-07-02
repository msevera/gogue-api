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

  async createWithId(authContext: AuthContextType, document: Omit<Note, 'userId' | 'workspaceId'>) {
    const resource = await super.create(authContext, {
      _id: document.id,
      ...document
    });

    return resource;

  }
} 