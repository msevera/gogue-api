import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersRepository } from './users.repository';
import { SetProfileDto } from './dto/set-profile.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import mongoose from 'mongoose';
import { AbstractService, findOneOptions } from '@app/common/services/abstract.service';
import { User } from './entities/user.entity';
import { Role } from '@app/common/dtos/role.enum.dto';
import { SetTopicsDto } from './dto/set-topics.dto';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Injectable()
export class UsersService extends AbstractService<User> {
  constructor(
    private firebaseService: FirebaseService,
    private usersRepository: UsersRepository,
    private workspacesService: WorkspacesService,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    super(usersRepository);
  }

  async findIn(ids: string[]) {
    return this.usersRepository.findIn(null, ids);
  }

  async findOneByUID(uid: string, options?: findOneOptions) {
    const resource = await this.usersRepository.findOne(null, { uid });
    super.throwErrorIfNotFound(resource, options);
    return resource;
  }

  async signIn(signInDto: SignInDto): Promise<User> {
    const firebaseUser = await this.firebaseService.getUser(signInDto.idToken);
    let user = await this.findOneByUID(firebaseUser.uid, { throwErrorIfNotFound: false });
    if (!user) {
      const userId = new mongoose.Types.ObjectId();
      const workspace = await this.workspacesService.create({
        name: 'Personal',
        userId: userId.toString(),
      });

      const [firstName, lastName] = firebaseUser?.displayName?.split(' ') || ['', '']

      user = await this.usersRepository.create(null, {
        _id: userId.toString(),
        uid: firebaseUser.uid,
        firstName,
        lastName,
        email: firebaseUser.email,
        pfp: firebaseUser.photoURL,
        phone: firebaseUser.phoneNumber,
        role: Role.CONSUMER,
        workspaces: [{
          workspaceId: workspace.id,
        }]
      });
    }

    return user;
  }

  async setProfile(id: string, profile: SetProfileDto): Promise<User> {
    const user = await this.usersRepository.updateOne(null, { id }, {
      $set: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      }
    });

    return user;
  }

  async setTopics(id: string, data: SetTopicsDto): Promise<User> {
    const topicsNames = data.topics.map(topic => topic.name);
    const topicsEmbeddings = await this.embeddingsService.embeddings.embedQuery(topicsNames.join(', '));

    const user = await this.usersRepository.updateOne(null, { id }, {
      $set: {
        topics: data.topics,
        topicsEmbeddings
      }
    });

    return user;
  }
}
