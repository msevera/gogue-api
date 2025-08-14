import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { DataLoaderFactory } from './data-loader.factory';
import { LecturesModule } from '../lectures/lectures.module';
import { NotesModule } from '../notes/notes.module';
import { LectureMetadataModule } from '../lecture-metadata/lecture-metadata.module';
import { CategoriesModule } from '../categories/categories.module';
import { SourcesModule } from 'src/sources/sources.module';

@Module({
  imports: [UsersModule, LecturesModule, NotesModule, LectureMetadataModule, CategoriesModule, SourcesModule],
  providers: [DataLoaderFactory],
  exports: [DataLoaderFactory],
})
export class DataLoaderModule {}
