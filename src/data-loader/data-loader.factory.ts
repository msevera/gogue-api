import { Injectable } from '@nestjs/common';
import { DataLoaderRegistry } from './data-loader.registry';
import { UsersRepository } from 'src/users/users.repository';
import { LecturesRepository } from 'src/lectures/lectures.repository';
import { NotesRepository } from 'src/notes/notes.repository';

@Injectable()
export class DataLoaderFactory {
    constructor(  
    private readonly usersRepository: UsersRepository,
    private readonly lecturesRepository: LecturesRepository,
    private readonly notesRepository: NotesRepository,
  ) {}

  create(): DataLoaderRegistry {
    return new DataLoaderRegistry(this.usersRepository, this.lecturesRepository, this.notesRepository);
  }
}
