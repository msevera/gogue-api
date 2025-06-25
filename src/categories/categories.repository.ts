import { BaseRepository } from '@app/common/database/base.repository';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

export class CategoriesRepository extends BaseRepository<Category> {
  constructor(
    @InjectModel(Category.name)
    categoriesModel: Model<Category>,
  ) {
    super(categoriesModel, Category);
  }

  async findByNameEmbeddings(embeddings: number[]): Promise<Category[]> {
    const result = await this.model.aggregate([
      {
        $vectorSearch: {
          index: 'name_embeddings_cosine',
          path: 'nameEmbeddings',
          queryVector: embeddings,
          numCandidates: 10,
          limit: 10,          
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
    ]);

    return result;
  }
}
