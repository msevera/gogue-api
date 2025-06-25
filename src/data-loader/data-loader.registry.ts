import { UsersRepository } from '../users/users.repository';
import { UsersDataLoader } from '../users/data-loaders/users.data-loader';
import { LecturesRepository } from '../lectures/lectures.repository';
import { LectureDataLoader } from '../lectures/data-loaders/lectures.data-loader';
import { NoteDataLoader } from '../notes/data-loaders/notes.data-loader';
import { NotesRepository } from '../notes/notes.repository';
import { LectureMetadataRepository } from '../lecture-metadata/lecture-metadata.repository';
import { LectureMetadataDataLoader } from '../lecture-metadata/data-loaders/lecture-metadata.data-loader';
import { CategoriesRepository } from '../categories/categories.repository';
import { CategoriesDataLoader } from '../categories/data-loaders/categories.data-loader';

export class DataLoaderRegistry {
  private cache: Record<string, any> = {};

  constructor(  
    private readonly usersRepository: UsersRepository,
    private readonly lecturesRepository: LecturesRepository,
    private readonly notesRepository: NotesRepository,
    private readonly lectureMetadataRepository: LectureMetadataRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  /**
   * Fetches a memoized service based on a string key, or invokes fallback to create one.
   */
  private get<T>(key: string, fallback: () => T): T {
    if (!this.cache[key]) {
      this.cache[key] = fallback();
    }
    return this.cache[key];
  }

  /** 
   * Just a pretty type-safe facade for invoking `this.get`.
   * Make more of your own as you wish.
   */
  public get users() {
    return this.get(
      'users',
      () => new UsersDataLoader(this.usersRepository),
    );
  }

  public get lectures() {
    return this.get(
      'lectures',
      () => new LectureDataLoader(this.lecturesRepository),
    );
  }

  public get notes() {
    return this.get(
      'notes',
      () => new NoteDataLoader(this.notesRepository),
    );
  }

  public get lectureMetadata() {
    return this.get(
      'lectureMetadata',
      () => new LectureMetadataDataLoader(this.lectureMetadataRepository),
    );
  }

  public get categories() {
    return this.get(
      'categories',
      () => new CategoriesDataLoader(this.categoriesRepository),
    );
  }
}