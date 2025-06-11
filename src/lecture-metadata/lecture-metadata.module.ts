import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { LectureMetadata } from './entities/lecture-metadata.entity';
import { LectureMetadataEntity } from './entities/lecture-metadata.entity';
import { LectureMetadataService } from './lecture-metadata.service';
import { LectureMetadataResolver } from './lecture-metadata.resolver';
import { LectureMetadataRepository } from './lecture-metadata.repository';

@Module({
  imports: [  
    MongooseModule.forFeature([{ name: LectureMetadata.name, schema: LectureMetadataEntity }]),
    UsersModule,    
  ],
  providers: [LectureMetadataResolver, LectureMetadataService, LectureMetadataRepository],
  exports: [MongooseModule, LectureMetadataService, LectureMetadataRepository]
})
export class LectureMetadataModule {} 