import { Module } from '@nestjs/common';
import { NoteMessagesService } from './note-messages.service';
import { NoteMessagesRepository } from './note-messages.repository';
import { NoteMessage, NoteMessageEntity } from './entities/note-message.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteMessagesResolver } from './note-messages.resolver';
import { UsersModule } from 'src/users/users.module';
import { NotesModule } from 'src/notes/notes.module';
import { NoteMessagesController } from './note-messages.controller';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [
    PubSubModule,
    NotesModule,
    UsersModule,
    MongooseModule.forFeature([{ name: NoteMessage.name, schema: NoteMessageEntity }]),
  ],
  controllers: [NoteMessagesController],
  providers: [NoteMessagesResolver, NoteMessagesService, NoteMessagesRepository],
  exports: [MongooseModule, NoteMessagesService]
})
export class NoteMessagesModule { }
