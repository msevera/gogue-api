import { Module } from '@nestjs/common';
import { NoteMessagesService } from './note-messages.service';
import { NoteMessagesRepository } from './note-messages.repository';
import { NoteMessage, NoteMessageEntity } from './entities/note-message.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteMessagesResolver } from './note-messages.resolver';
import { UsersModule } from 'src/users/users.module';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [    
    NotesModule,
    UsersModule,
    MongooseModule.forFeature([{ name: NoteMessage.name, schema: NoteMessageEntity }]),
  ],
  providers: [NoteMessagesResolver, NoteMessagesService, NoteMessagesRepository],
  exports: [MongooseModule, NoteMessagesService]
})
export class NoteMessagesModule {}
