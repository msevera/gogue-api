import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { GlimpseStatus } from './entities/glimpse-status.entity';

@Injectable()
export class GlimpsesStatusRepository extends CurrentAuthRepository<GlimpseStatus> {
  constructor(
    @InjectModel(GlimpseStatus.name)
    glimpseStatusModel: Model<GlimpseStatus>
  ) {
    super(glimpseStatusModel, GlimpseStatus);
  }
}