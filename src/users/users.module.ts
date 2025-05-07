import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from './entities/user.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersRepository } from './users.repository';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
    FirebaseModule,
    WorkspacesModule
  ],
  providers: [UsersResolver, UsersService, FirebaseService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
