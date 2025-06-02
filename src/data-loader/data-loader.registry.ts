import { UsersRepository } from 'src/users/users.repository';
import { UsersDataLoader } from 'src/users/data-loaders/users.data-loader';
import { LecturesRepository } from 'src/lectures/lectures.repository';
import { LectureDataLoader } from 'src/lectures/data-loaders/items.data-loader';
import { NoteDataLoader } from 'src/notes/data-loaders/notes.data-loader';
import { NotesRepository } from 'src/notes/notes.repository';

export class DataLoaderRegistry {
  private cache: Record<string, any> = {};

  constructor(  
    private readonly usersRepository: UsersRepository,
    private readonly lecturesRepository: LecturesRepository,
    private readonly notesRepository: NotesRepository,
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
}