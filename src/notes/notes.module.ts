import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note, NoteEntity } from './entities/note.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesResolver } from './notes.resolver';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [
    PubSubModule,
    MongooseModule.forFeature([{ name: Note.name, schema: NoteEntity }]),
  ],
  providers: [NotesResolver, NotesService, NotesRepository],
  exports: [MongooseModule, NotesService]
})
export class NotesModule {}
