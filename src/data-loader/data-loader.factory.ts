import { Injectable } from '@nestjs/common';
import { DataLoaderRegistry } from './data-loader.registry';
import { UsersRepository } from 'src/users/users.repository';
import { LecturesRepository } from 'src/lectures/lectures.repository';
@Injectable()
export class DataLoaderFactory {
    constructor(  
    private readonly usersRepository: UsersRepository,
    private readonly lecturesRepository: LecturesRepository,
  ) {}

  create(): DataLoaderRegistry {
    return new DataLoaderRegistry(this.usersRepository, this.lecturesRepository);
  }
}
