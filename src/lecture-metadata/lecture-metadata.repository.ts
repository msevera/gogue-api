import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { LeanOptions, SessionOptions, ListOptions } from '@app/common/database/options';

@Injectable()
export class LectureMetadataRepository extends CurrentAuthRepository<LectureMetadata> {
  constructor(
    @InjectModel(LectureMetadata.name)
    lectureMetadataModel: Model<LectureMetadata>
  ) {
    super(lectureMetadataModel, LectureMetadata);
  }

  async findInLectures(
    authContext: AuthContextType | false,
    ids: readonly string[],
    options: LeanOptions & SessionOptions = { lean: true },
  ): Promise<LectureMetadata[]> {
    const resources = await this.findWithFilter(
      authContext,
      {
        lectureId: {
          $in: ids,
        },
      },
      {
        lean: options.lean,
        session: options.session,
      },
    );

    return resources.items;
  }
} 