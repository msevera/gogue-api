import { Controller } from '@nestjs/common';
import { MessagePattern, Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { NoteMessagesService } from './note-messages.service';
import { NoteMessageCreatedServiceDto } from './dto/note-message-created.service.dto';

@Controller()
export class NoteMessagesController {
  constructor(private readonly noteMessagesService: NoteMessagesService) { }

  @MessagePattern('note.message.created')
  async handleNoteMessageCreated(@Ctx() context: KafkaContext, @Payload() data: NoteMessageCreatedServiceDto) {
    console.log('Received Note Message Created:', data.noteId);
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const message = context.getMessage();
    const partition = context.getPartition();
    const offset = message.offset;    
    await this.noteMessagesService.handleNoteMessageCreated(data);
    await consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }])    
  }
}
