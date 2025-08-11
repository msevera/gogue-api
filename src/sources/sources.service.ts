import { Injectable } from '@nestjs/common';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { AbstractService } from '@app/common/services/abstract.service';

import { SourceRepository } from './sources.repository';
import { Source } from './entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { StorageService } from 'src/storage/storage.service';
import { CategoriesService } from 'src/categories/categories.service';
import mongoose from 'mongoose';
import { MatchedSourcesInputDto } from './dto/matched-sources.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';

@Injectable()
export class SourceService extends AbstractService<Source> {
  constructor(
    private readonly sourcesRepository: SourceRepository,
    private readonly embeddingsService: EmbeddingsService,
    private readonly storageService: StorageService,
    private readonly categoriesService: CategoriesService,
  ) {
    super(sourcesRepository);
  }

  async findMatched(input: MatchedSourcesInputDto, pagination: PaginationDto<Source>) {
    const inputEmbeddings = await this.embeddingsService.embeddings.embedQuery(input.input);
    return this.sourcesRepository.findMatched(inputEmbeddings, pagination);
  }

  async createOne(input: CreateSourceDto) {
    const newSourceId = new mongoose.Types.ObjectId();
    const image = await this.storageService.uploadImageFromUrl(input.imageUrl, `sources/images/${newSourceId.toString()}`);
    const internalDescriptionEmbeddings = await this.embeddingsService.embeddings.embedDocuments([input.internalDescription]);
    const { items: existingCategories } = await this.categoriesService.findByNames(input.categories);

    const existingNames = new Set(existingCategories.map(c => c.name));
    const missingNames = input.categories.filter(name => !existingNames.has(name));

    let newCategories = [];
    if (missingNames.length > 0) {
      newCategories = await this.categoriesService.createMany(missingNames.map(name => ({ name })));
    }

    return this.sourcesRepository.create(false, {
      _id: newSourceId.toString(),
      title: input.title,
      overview: input.overview,
      internalDescription: input.internalDescription,
      internalDescriptionEmbeddings: internalDescriptionEmbeddings[0],
      image: {
        url: image.path,
        mimeType: image.mimeType,
        extension: image.extension,
        width: image.width,
        height: image.height,
        color: image.color,
      },
      categories: [...existingCategories, ...newCategories]
        .map(category => ({
          categoryId: category.id
        })),
      authors: input.authors,
    });
  }
} 