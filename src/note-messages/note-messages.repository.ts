import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NoteMessage } from './entities/note-message.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';

@Injectable()
export class NoteMessagesRepository extends CurrentAuthRepository<NoteMessage> {
  constructor(
    @InjectModel(NoteMessage.name)
    noteMessageModel: Model<NoteMessage>
  ) {
    super(noteMessageModel, NoteMessage);
  }
} 