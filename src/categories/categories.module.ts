import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategoryEntity } from './entities/category.entity';
import { CategoriesRepository } from './categories.repository';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { CategoriesService } from './categories.service';
import { LecturesModule } from '../lectures/lectures.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategoryEntity }]),  
    EmbeddingsModule
  ],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
