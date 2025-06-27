import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { LeanOptions, SessionOptions, ListOptions } from '@app/common/database/options';
import { FindLecturesInputDto } from 'src/lectures/dto/find-lectures.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { ObjectId } from 'mongodb';
import { LectureMetadataStatus } from '@app/common/dtos/lecture-matadata-status.enum.dto';

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

  async findLecturesAddedToLibrary(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    super.checkLimit(pagination as ListOptions<LectureMetadata>);

    const result = await this.model.aggregate([
      {
        $match: {
          addedToLibrary: true,
          userId: new ObjectId(authContext.user.id),
          workspaceId: new ObjectId(authContext.workspaceId),         
        }
      },
      {
        $sort: {
          addedToLibraryAt: -1
        }
      },
      {
        $skip: pagination?.next * pagination?.limit
      },
      {
        $limit: pagination?.limit + 1,
      },
      {
        $lookup: {
          from: 'lectures',
          localField: 'lectureId',
          foreignField: '_id',
          as: 'lecture'
        }
      },       
      {
        $unwind: '$lecture'
      },
      {
        $replaceRoot: {
          newRoot: '$lecture'
        }
      },
      {
        $addFields: {
          id: '$_id'
        }
      }
    ]).exec();

    const hasNext = result.length > pagination?.limit;
    const items = hasNext ? result.slice(0, result.length - 1) : result;
    return super.wrapIntoCursor(items, {
      hasPrev: false,
      prev: null,
      hasNext,
      next: hasNext ? (pagination?.next || 0) + 1 : null,
    });
  }

  async findLecturesRecentlyPlayed(authContext: AuthContextType, pagination?: PaginationDto<Lecture>) {
    super.checkLimit(pagination as ListOptions<LectureMetadata>);

    const result = await this.model.aggregate([
      {
        $match: {
          userId: new ObjectId(authContext.user.id),
          workspaceId: new ObjectId(authContext.workspaceId),  
          status: LectureMetadataStatus.IN_PROGRESS       
        }
      },
      {
        $sort: {
          lastPlaybackAt: -1
        }
      },
      {
        $skip: pagination?.next * pagination?.limit
      },
      {
        $limit: pagination?.limit + 1,
      },
      {
        $lookup: {
          from: 'lectures',
          localField: 'lectureId',
          foreignField: '_id',
          as: 'lecture'
        }
      },     
      {
        $unwind: '$lecture'
      },
      {
        $replaceRoot: {
          newRoot: '$lecture'
        }
      },
      {
        $addFields: {
          id: '$_id'
        }
      }
    ]).exec();

    const hasNext = result.length > pagination?.limit;
    const items = hasNext ? result.slice(0, result.length - 1) : result;
    return super.wrapIntoCursor(items, {
      hasPrev: false,
      prev: null,
      hasNext,
      next: hasNext ? (pagination?.next || 0) + 1 : null,
    });
  }
} 