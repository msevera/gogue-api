import { Injectable } from '@nestjs/common';
import { AbstractService } from '@app/common/services/abstract.service';
import { LectureMetadataRepository } from './lecture-metadata.repository';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { LectureMetadataStatus } from '@app/common/dtos/lecture-matadata-status.enum.dto';
import { FindLecturesInputDto } from '../lectures/dto/find-lectures.dto';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';

@Injectable()
export class LectureMetadataService extends AbstractService<LectureMetadata> {
  constructor(
    private readonly lectureMetadataRepository: LectureMetadataRepository
  ) {
    super(lectureMetadataRepository);
  }

  async findLectures(authContext: AuthContextType, input: FindLecturesInputDto, pagination?: PaginationDto<Lecture>) {
    return this.lectureMetadataRepository.findLectures(authContext, input, pagination);
  }

  async setPlaybackTimestamp(authContext: AuthContextType, lectureId: string, timestamp: number) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.create(authContext, { lectureId, playbackTimestamp: timestamp, status: LectureMetadataStatus.IN_PROGRESS });
    } else {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $set: { playbackTimestamp: timestamp, status: LectureMetadataStatus.IN_PROGRESS } });
    }
    return lectureMetadata;
  }

  async setStatus(authContext: AuthContextType, lectureId: string, status: LectureMetadataStatus) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.create(authContext, { lectureId, status });
    } else {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $set: { status } });
    }
    return lectureMetadata;
  }

  async addNote(authContext: AuthContextType, lectureId: string) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.create(authContext, { lectureId, notesCount: 1 });
    } else {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $inc: { notesCount: 1 } });
    }
    return lectureMetadata;
  }

  async removeNote(authContext: AuthContextType, lectureId: string) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $inc: { notesCount: -1 } });
    }
    return lectureMetadata;
  }

  async addToLibrary(authContext: AuthContextType | false, lectureId: string) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (!lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.create(authContext, { lectureId, addedToLibrary: true, addedToLibraryAt: new Date() });
    } else {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $set: { addedToLibrary: true, addedToLibraryAt: new Date() } });
    }
    return lectureMetadata;
  }
  
  async removeFromLibrary(authContext: AuthContextType, lectureId: string) {
    let lectureMetadata = await this.lectureMetadataRepository.findOne(authContext, { lectureId });
    if (lectureMetadata) {
      lectureMetadata = await this.lectureMetadataRepository.updateOne(authContext, { lectureId }, { $set: { addedToLibrary: false, addedToLibraryAt: null } });
    }
    return lectureMetadata;
  }
} 