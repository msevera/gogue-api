import { BaseRepository } from '@app/common/database/base.repository';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    usersModel: Model<User>,
  ) {
    super(usersModel, User);
  }
}
