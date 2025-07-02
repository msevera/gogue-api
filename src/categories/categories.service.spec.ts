import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { Category, CategoryEntity } from './entities/category.entity';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { LecturesService } from '../lectures/lectures.service';
import { Lecture, LectureEntity } from '../lectures/entities/lecture.entity';
import { LecturesRepository } from '../lectures/lectures.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { defineBeforeEach } from '../../test/global';
import { LectureAgentService } from '../lecture-agent/lecture-agent.service';
import { CategoriesModule } from './categories.module';
import { LecturesModule } from '../lectures/lectures.module';
import { LectureAgentModule } from '../lecture-agent/lecture-agent.module';
import { AppModule } from '../app.module';



describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let lectureService: LecturesService;

  beforeEach(async () => {
    const res = await defineBeforeEach({
      imports: [        
        AppModule
      ],
      providers: [
        // CategoriesService,
        // CategoriesRepository,
        // LecturesService,
        // LecturesRepository,
        // { provide: LectureAgentService, useValue: {} },
      ],
    })
    categoriesService = res.module.get<CategoriesService>(CategoriesService);
    lectureService = res.module.get<LecturesService>(LecturesService);
  });

  it('should be defined', async () => {
    expect(categoriesService).toBeDefined();
    expect(lectureService).toBeDefined();

    const lecture = await lectureService.findOne(false, '685a99f52174e8fb39f7af48')
    const categories = await categoriesService.findByNameEmbeddings(lecture.topicEmbeddings)
    console.log('categories',categories.map(c => c.name))
  });
});
