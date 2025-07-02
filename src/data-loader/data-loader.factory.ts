import { Injectable } from '@nestjs/common';
import { DataLoaderRegistry } from './data-loader.registry';
import { UsersRepository } from '../users/users.repository';
import { LecturesRepository } from '../lectures/lectures.repository';
import { NotesRepository } from '../notes/notes.repository';
import { LectureMetadataRepository } from '../lecture-metadata/lecture-metadata.repository';
import { CategoriesRepository } from 'src/categories/categories.repository';

@Injectable()
export class DataLoaderFactory {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly lecturesRepository: LecturesRepository,
    private readonly notesRepository: NotesRepository,
    private readonly lectureMetadataRepository: LectureMetadataRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) { }

  create(): DataLoaderRegistry {
    return new DataLoaderRegistry(
      this.usersRepository,
      this.lecturesRepository,
      this.notesRepository,
      this.lectureMetadataRepository,
      this.categoriesRepository
    );
  }
}
