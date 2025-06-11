import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { DataLoaderFactory } from './data-loader.factory';
import { LecturesModule } from 'src/lectures/lectures.module';
import { NotesModule } from 'src/notes/notes.module';
import { LectureMetadataModule } from 'src/lecture-metadata/lecture-metadata.module';

@Module({
  imports: [UsersModule, LecturesModule, NotesModule, LectureMetadataModule],
  providers: [DataLoaderFactory],
  exports: [DataLoaderFactory],
})
export class DataLoaderModule {}
