import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from '@app/common/services/abstract.service';
import { SourceRepository } from './sources.repository';
import { Source } from './entities/source.entity';
import { UpsertSourceDto } from './dto/upsert-source.dto';
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

  private readonly IMAGE_PREFIX = 'sources/images';

  private async computeEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    return this.embeddingsService.embeddings.embedDocuments(texts);
  }

  private async computeEmbedding(text: string): Promise<number[]> {
    const [embedding] = await this.computeEmbeddingsBatch([text]);
    return embedding;
  }

  private async prepareCategories(categoryNames: string[]): Promise<{ categoryId: string }[]> {
    const { items: existingCategories } = await this.categoriesService.findByNames(categoryNames);
    const existingNames = new Set(existingCategories.map(c => c.name));
    const missingNames = categoryNames.filter(name => !existingNames.has(name));

    let newCategories = [] as any[];
    if (missingNames.length > 0) {
      newCategories = await this.categoriesService.createMany(
        missingNames.map(name => ({ name })),
      );
    }

    return [...existingCategories, ...newCategories].map(category => ({
      categoryId: category.id,
    }));
  }

  private async generateOrUploadImage(
    item: { imageUrl?: string; title?: string; authors?: string[]; topic?: string },
    destinationPrefix: string,
  ) {
    if (item.imageUrl === '') {
      const authorLine = item.authors && item.authors.length > 0 ? ` by ${item.authors.join(', ')}` : '';
      const prompt = `Generate book cover for "${item.title ?? ''}"${authorLine}`;
      const openai = new (await import('openai')).default();
      const result = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        quality: 'medium',
        n: 1,
        output_format: 'png',
        background: 'opaque',
        size: '1024x1536',
      });
      const imageBase64 = result.data[0].b64_json as string;
      const bytes = Buffer.from(imageBase64, 'base64');
      return this.storageService.uploadImageFromBuffer(bytes, destinationPrefix);
    }

    if (!!item.imageUrl) {
      return this.storageService.uploadImageFromUrl(item.imageUrl, destinationPrefix);
    }

    return undefined;
  }

  async findMatched(input: MatchedSourcesInputDto, pagination: PaginationDto<Source>) {
    const inputEmbeddings = await this.embeddingsService.embeddings.embedQuery(input.input);
    return this.sourcesRepository.findMatched(inputEmbeddings, pagination);
  }

  async upsertMany(input: UpsertSourceDto[]) {
    if (!input || input.length === 0) {
      return [] as Source[];
    }

    console.log('Upserting sources', input.length);
    const titles = input.map(i => i.title);
    const existingList = await this.sourcesRepository.find(false, { title: { $in: titles } }, { limit: 1000 });
    console.log('existingList', existingList.items.length);
    const titleToExisting = new Map(existingList.items.map(s => [s.title, s] as const));

    const results: Source[] = [];

    for (let i = 0; i < input.length; i += 10) {
      const chunk = input.slice(i, i + 10);

      const indicesToEmbed: number[] = [];
      const textsToEmbed: string[] = [];
      for (let j = 0; j < chunk.length; j++) {
        const desc = chunk[j]?.internalDescription;
        if (typeof desc === 'string' && desc.length > 0) {
          indicesToEmbed.push(j);
          textsToEmbed.push(desc);
        }
      }

      const embeddedBatch =
        textsToEmbed.length > 0 ? await this.computeEmbeddingsBatch(textsToEmbed) : [];
      const embeddingMap = new Map<number, number[]>();
      for (let k = 0; k < indicesToEmbed.length; k++) {
        embeddingMap.set(indicesToEmbed[k], embeddedBatch[k]);
      }

      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const embedding = embeddingMap.get(j);
        const existing = titleToExisting.get(item.title);

        if (existing) {
          const image = await this.generateOrUploadImage(item, `${this.IMAGE_PREFIX}/${existing.id.toString()}`);

          const categories = await this.prepareCategories(item.categories);

          console.log('Updating source', existing.id, existing.title);
          const updated = await this.sourcesRepository.updateOne(
            false,
            { id: existing.id },
            {
              $set: {
                title: item.title,
                overview: item.overview,
                internalDescription: item.internalDescription,
                internalDescriptionEmbeddings: embedding,
                image: image ? {
                  url: image.path,
                  mimeType: image.mimeType,
                  extension: image.extension,
                  width: image.width,
                  height: image.height,
                  color: image.color,
                } : undefined,
                categories,
                authors: item.authors,
                sections: item.sections,
                topic: item.topic,
                keyInsights: item.keyInsights,
                keyTakeaways: item.keyTakeaways,
              },
            },
          );

          results.push(updated);
        } else {
          const newSourceId = new mongoose.Types.ObjectId();
          const image = await this.generateOrUploadImage(item, `${this.IMAGE_PREFIX}/${newSourceId.toString()}`);

          const categories = await this.prepareCategories(item.categories);

          console.log('Creating source', newSourceId.toString(), item.title);
          const created = await this.sourcesRepository.create(false, {
            _id: newSourceId.toString(),
            title: item.title,
            overview: item.overview,
            internalDescription: item.internalDescription,
            internalDescriptionEmbeddings: embedding,
            image: image ? {
              url: image.path,
              mimeType: image.mimeType,
              extension: image.extension,
              width: image.width,
              height: image.height,
              color: image.color,
            } : undefined,
            categories,
            authors: item.authors,
            sections: item.sections,
            topic: item.topic,
            keyInsights: item.keyInsights,
            keyTakeaways: item.keyTakeaways,
          });

          results.push(created);
        }
      }
    }

    console.log('Upserting sources done', results.length);
    
    return results;
  }
} 