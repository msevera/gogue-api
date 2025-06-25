import { forwardRef, Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note, NoteEntity } from './entities/note.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesResolver } from './notes.resolver';
import { PubSubModule } from '../pubsub/pubsub.module';
import { LecturesModule } from '../lectures/lectures.module';
import { LectureMetadataModule } from '../lecture-metadata/lecture-metadata.module';
import { NoteMessagesModule } from '../note-messages/note-messages.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    forwardRef(() => NoteMessagesModule),
    LectureMetadataModule,
    forwardRef(() => LecturesModule),
    PubSubModule,
    MongooseModule.forFeature([{ name: Note.name, schema: NoteEntity }]),
    KafkaModule,
  ],
  providers: [NotesResolver, NotesService, NotesRepository],
  exports: [MongooseModule, NotesService, NotesRepository]
})
export class NotesModule { }
