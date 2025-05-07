import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from '../users/users.repository';
import { defineBeforeEach } from '../../test/global';
import { User, UserEntity } from '../users/entities/user.entity';
import { UsersService } from './users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseServiceMock } from '../firebase/__mock__/firebase.service.mock';
import { Types } from 'mongoose';
import { Role } from '@app/common/dtos/role.enum.dto';

describe('UserService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  beforeEach(async () => {
    const res = await defineBeforeEach({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
      ],
      providers: [
        UsersRepository,
        UsersService,
        {
          provide: FirebaseService,
          useValue: FirebaseServiceMock,
        },
      ],
    });
    service = res.module.get<UsersService>(UsersService);
    repository = res.module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('User should be created', async () => {
    const user = await repository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
      pfp: 'https://pft.jpeg',
      phone: '+1234567890',
      uid: '123',
      role: Role.CONSUMER,
    });

    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });

  it('User with predefined id should be created', async () => {
    const newId = new Types.ObjectId().toString();
    const user = await repository.create({
      _id: newId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
      pfp: 'https://pft.jpeg',
      phone: '+1234567890',
      uid: '123',
      role: Role.CONSUMER,
    });

    expect(user.id).toBe(newId);
  });

  it('User profile should be updated', async () => {
    const newId = new Types.ObjectId().toString();
    const user = await repository.create({
      _id: newId,
      firstName: '',
      lastName: '',
      email: 'john@gmail.com',
      pfp: 'https://pft.jpeg',
      phone: '+1234567890',
      uid: '123',
      role: Role.CONSUMER,
    });

    const updatedUser = await service.setProfile(user.id, {
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(updatedUser.firstName).toBe('John');
    expect(updatedUser.lastName).toBe('Doe');
  });
});
