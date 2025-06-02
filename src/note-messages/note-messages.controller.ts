import { Controller } from '@nestjs/common';
import { MessagePattern, Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { NoteMessagesService } from './note-messages.service';
import { NoteMessageCreatedServiceDto } from './dto/note-message-created.service.dto';

@Controller()
export class LectureTTSController {
  constructor(private readonly noteMessagesService: NoteMessagesService) { }

  @MessagePattern('note-message.tts.completed')
  async handleTTSCompleted(@Ctx() context: KafkaContext, @Payload() data: NoteMessageCreatedServiceDto) {
    console.log('Received TTS Completed:', data);
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const message = context.getMessage();
    const partition = context.getPartition();
    const offset = message.offset;
    consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }])    
    await this.noteMessagesService.handleNoteMessageCreated(data);
  }
}
