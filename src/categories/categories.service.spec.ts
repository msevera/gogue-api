import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { Category, CategoryEntity } from './entities/category.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: jest.Mocked<CategoriesRepository>;
  let embeddingsService: jest.Mocked<EmbeddingsService>;

  beforeEach(async () => {
    const mockCategoriesRepository = {
      createMany: jest.fn(),
      findByNameEmbeddings: jest.fn(),
    };

    const mockEmbeddingsService = {
      embeddings: {
        embedDocuments: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: Category.name, schema: CategoryEntity }]),  
        EmbeddingsModule,
      ],
      providers: [        
        CategoriesService  
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get(CategoriesRepository);
    embeddingsService = module.get(EmbeddingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
