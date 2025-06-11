import { Injectable } from '@nestjs/common';
import { AbstractService } from '@app/common/services/abstract.service';
import { LectureMetadataRepository } from './lecture-metadata.repository';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';

@Injectable()
export class LectureMetadataService extends AbstractService<LectureMetadata> {
  constructor(
    private readonly lectureMetadataRepository: LectureMetadataRepository
  ) {
    super(lectureMetadataRepository);
  }

  async addPlaybackTimestamp(authContext: AuthContextType, lectureId: string, timestamp: number) {
    const lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      await this.lectureMetadataRepository.create(authContext, { lectureId, playbackTimestamp: timestamp });
    } else {
      await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $set: { playbackTimestamp: timestamp } });
    }
  }

  async addNote(authContext: AuthContextType, lectureId: string) {
    const lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      await this.lectureMetadataRepository.create(authContext, { lectureId, notesCount: 1 });
    } else {
      await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $inc: { notesCount: 1 } });
    }
  }

  async removeNote(authContext: AuthContextType, lectureId: string) {
    const lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (lectureMetadata) {
      await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $inc: { notesCount: -1 } });
    }
  }
} 