import { ResolveField, Parent, Context, Resolver } from '@nestjs/graphql';
import { LectureMetadataService } from './lecture-metadata.service';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { DataLoaderRegistry } from 'src/data-loader/data-loader.registry';
import { Lecture } from 'src/lectures/entities/lecture.entity';


@Resolver(() => LectureMetadata)
export class LectureMetadataResolver {
  constructor(
    private readonly lectureMetadataService: LectureMetadataService,
  ) { }

  @ResolveField('lecture', () => Lecture)
  async lecture(
    @Parent() item: LectureMetadata,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry },
  ) {
    return dataLoaders.lectures.findOne(item.lectureId.toString());
  }
  
} 