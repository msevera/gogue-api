import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserEntity } from './entities/user.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersRepository } from './users.repository';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { UsersTopicsAgentController } from './users-topics-agent.controller';
import { UsersTopicsAgentService } from './users-topics-agent.service';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'glimpses',
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
    FirebaseModule,
    WorkspacesModule,
    EmbeddingsModule
  ],
  controllers: [UsersTopicsAgentController],
  providers: [UsersResolver, UsersService, FirebaseService, UsersRepository, UsersTopicsAgentService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
