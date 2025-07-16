import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Glimpse, GlimpseEntity } from './entities/glimpse.entity';
import { GlimpsesService } from './glimpses.service';
import { GlimpsesResolver } from './glimpses.resolver';
import { GlimpsesRepository } from './glimpses.repository';
import { GlimpseCheckpoint, GlimpseCheckpointEntity } from './entities/glimpse-checkpoint.entity';
import { GlimpsesCheckpointRepository } from './glimpses-checkpoint.repository';
import { GlimpseStatus, GlimpseStatusEntity } from './entities/glimpse-status.entity';
import { BullModule } from '@nestjs/bullmq';
import { PubSubModule } from '../pubsub/pubsub.module';
import { GlimpsesStatusRepository } from './glimpses-status.repository';
import { GlimpsesAgentService } from './glimpses-agent.service';
import { GlimpsesConsumer } from './glimpses.consumer';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    BullModule.registerQueue({
      name: 'glimpses',
    }),
    MongooseModule.forFeature([{ name: Glimpse.name, schema: GlimpseEntity }]),
    MongooseModule.forFeature([{ name: GlimpseCheckpoint.name, schema: GlimpseCheckpointEntity }]),
    MongooseModule.forFeature([{ name: GlimpseStatus.name, schema: GlimpseStatusEntity }]),
    PubSubModule,
    UsersModule
  ],
  providers: [
    GlimpsesResolver, GlimpsesService, GlimpsesRepository, GlimpsesCheckpointRepository, GlimpsesStatusRepository, GlimpsesAgentService, 
    GlimpsesConsumer],
  exports: [MongooseModule, GlimpsesService]
})
export class GlimpsesModule { } 