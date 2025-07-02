import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';
import { Category } from '../entities/category.entity';
import { CategoriesRepository } from '../categories.repository';

export class CategoriesDataLoader extends AbstractDataLoader<Category> {
  constructor(private readonly categoriesRepository: CategoriesRepository) {
    super(categoriesRepository);
  }
}
