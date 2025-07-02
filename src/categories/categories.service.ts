import { Injectable } from '@nestjs/common';
import { AbstractService } from '@app/common/services/abstract.service';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class CategoriesService extends AbstractService<Category> {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    super(categoriesRepository);
  }

  async createMany(input: CreateCategoryDto[]) {
    const nameEmbeddings = await this.embeddingsService.embeddings.embedDocuments(input.map(category => category.name));
    return this.categoriesRepository.createMany(null, input.map((category, index) => ({
      name: category.name,
      nameEmbeddings: nameEmbeddings[index],
    })));
  }

  async findByNameEmbeddings(embeddings: number[]) {
    return this.categoriesRepository.findByNameEmbeddings(embeddings);
  }
} 