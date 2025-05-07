import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';

export class UsersDataLoader extends AbstractDataLoader<User> {
  constructor(private readonly usersRepository: UsersRepository) {
    super(usersRepository);
  }
}
