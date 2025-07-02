import * as DataLoader from 'dataloader'
import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';
import { LectureMetadataRepository } from '../lecture-metadata.repository';
import { LectureMetadata } from '../entities/lecture-metadata.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';

type DataLoaderType = {
  authContext: AuthContextType;
  lectureId: string;
}

export class LectureMetadataDataLoader extends AbstractDataLoader<LectureMetadata> {
  private findOneWithAuthLoader: DataLoader<DataLoaderType, LectureMetadata>;

  constructor(private readonly lectureMetadataRepository: LectureMetadataRepository) {
    super(lectureMetadataRepository);
    this.findOneWithAuthLoader = new DataLoader<DataLoaderType, LectureMetadata>(async (items: readonly DataLoaderType[]) => {
      const [item] = items;
      const { authContext } = item;          
      const lecturesIds = items.map((item) => item.lectureId);      
      const resources = await this.lectureMetadataRepository.findInLectures(authContext, lecturesIds);
      return items.map(({lectureId}) => resources.find((s) => s.lectureId === lectureId));
    });
  }

  findOneWithAuth(authContext: AuthContextType, lectureId: string) {
    return this.findOneWithAuthLoader.load({ authContext, lectureId });
  }
}
