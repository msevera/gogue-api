import { Glimpse } from './entities/glimpse.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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

  async setQueries(authContext: AuthContextType, queries: { id: string, query: string }[]) {
    const resources = await this.findIn(authContext, queries.map(query => query.id))    
    const updates = queries.map(query => ({
      id: new mongoose.Types.ObjectId(query.id),
      query: query.query
    }));
  
    // Build a bulk operation array:
    const ops = updates.map(u => ({
      updateOne: {
        filter:   { _id: u.id },
        update:   { $set: { query: u.query } },
        upsert:   false            // or true if you want to insert missing docs
      }
    }));
  
    // Send them all in one go:
    const result = await this.model.bulkWrite(ops, { ordered: true });  

    for (const res of resources) {
      await this.clearResourceFromCache(res);
    }
  }

}