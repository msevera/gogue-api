import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Source, SourceEntity } from './entities/source.entity';
import { SourcesResolver } from './sources.resolver';
import { SourceRepository } from './sources.repository';
import { SourceService } from './sources.service';
import { StorageModule } from '../storage/storage.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Source.name, schema: SourceEntity }]),
    StorageModule,
    EmbeddingsModule,
    CategoriesModule
  ],
  providers: [SourcesResolver, SourceService, SourceRepository],
  exports: [MongooseModule, SourceService, SourceRepository]
})
export class SourcesModule {} 