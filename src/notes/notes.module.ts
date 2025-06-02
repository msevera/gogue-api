import { forwardRef, Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note, NoteEntity } from './entities/note.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesResolver } from './notes.resolver';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { LecturesModule } from 'src/lectures/lectures.module';

@Module({
  imports: [
    forwardRef(() => LecturesModule),
    PubSubModule,
    MongooseModule.forFeature([{ name: Note.name, schema: NoteEntity }]),
  ],
  providers: [NotesResolver, NotesService, NotesRepository],
  exports: [MongooseModule, NotesService, NotesRepository]
})
export class NotesModule {}
