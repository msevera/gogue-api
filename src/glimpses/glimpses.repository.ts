import { Glimpse } from './entities/glimpse.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';

@Injectable()
export class GlimpsesRepository extends CurrentAuthRepository<Glimpse> {
  constructor(
    @InjectModel(Glimpse.name)
    glimpseModel: Model<Glimpse>
  ) {
    super(glimpseModel, Glimpse);
  }


  async findOneByTopicId(authContext: AuthContextType, topicId: string) : Promise<Glimpse | null> {
    return this.model.findOne(authContext, { topicId });
  }

}