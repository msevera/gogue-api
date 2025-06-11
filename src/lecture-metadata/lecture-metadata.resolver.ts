import { Resolver } from '@nestjs/graphql';
import { LectureMetadataService } from './lecture-metadata.service';
import { LectureMetadata } from './entities/lecture-metadata.entity';


@Resolver(() => LectureMetadata)
export class LectureMetadataResolver {
  constructor(
    private readonly lectureMetadataService: LectureMetadataService,
  ) { }

  
  
} 