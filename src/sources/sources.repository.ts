import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@app/common/database/base.repository';
import { Source } from './entities/source.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';

@Injectable()
export class SourceRepository extends BaseRepository<Source> {
  constructor(
    @InjectModel(Source.name)
    sourceModel: Model<Source>
  ) {
    super(sourceModel, Source);
  }

  async findMatched(
    inputEmbeddings: number[],
    pagination?: PaginationDto<Source>) {
    const result = await this.model.aggregate(
      [
        {
          $vectorSearch: {
            index: 'internal_description_embeddings_cosine',
            path: 'internalDescriptionEmbeddings',
            queryVector: inputEmbeddings,
            numCandidates: 10 * 20,
            limit: 15,
          }
        },
        {
          $addFields: {
            id: '$_id',
            score: {
              $meta: 'vectorSearchScore'
            }
          }
        }
      ]
    ).exec();

    // console.log('result', result.map(r => ({
    //   id: r._id,
    //   score: r.score,
    //   name: r.name,
    //   topic: r.topic
    // })));

    return super.wrapIntoCursor(result, {
      hasPrev: false,
      prev: null,
      hasNext: false,
      next: null,
    });
  }
} 