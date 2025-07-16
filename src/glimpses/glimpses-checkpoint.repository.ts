import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { GlimpseCheckpoint } from './entities/glimpse-checkpoint.entity';

@Injectable()
export class GlimpsesCheckpointRepository extends CurrentAuthRepository<GlimpseCheckpoint> {
  constructor(
    @InjectModel(GlimpseCheckpoint.name)
    glimpseCheckpointModel: Model<GlimpseCheckpoint>
  ) {
    super(glimpseCheckpointModel, GlimpseCheckpoint);
  }

  async findOneByTopicId(authContext: AuthContextType, topicId: string) : Promise<GlimpseCheckpoint | null> {
    return this.findOne(authContext, { topicId });
  }
}