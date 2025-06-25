import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategoryEntity } from './entities/category.entity';
import { CategoriesRepository } from './categories.repository';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategoryEntity }]),  
    EmbeddingsModule,
  ],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
