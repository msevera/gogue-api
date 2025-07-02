import { registerEnumType } from '@nestjs/graphql';

export enum LectureMetadataStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

registerEnumType(LectureMetadataStatus, {
  name: 'LectureMetadataStatus',
});
