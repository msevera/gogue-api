import { Controller } from '@nestjs/common';
import { MessagePattern, Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { LecturesService } from './lectures.service';
import { LectureTTSCompletedServiceDto } from './dto/lecture-tts-completed.service.dto';

@Controller()
export class LectureTTSController {
  constructor(private readonly lecturesService: LecturesService) { }

  @MessagePattern('lecture.tts.completed')
  async handleTTSCompleted(@Ctx() context: KafkaContext, @Payload() data: LectureTTSCompletedServiceDto) {
    console.log('Received TTS Completed:', data.id);
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const message = context.getMessage();
    const partition = context.getPartition();
    const offset = message.offset;
    await consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }])
    await this.lecturesService.handleTTSCompleted(data);
  }

  @MessagePattern('lecture.tts.recreated')
  async handleTTSRecreated(@Ctx() context: KafkaContext, @Payload() data: LectureTTSCompletedServiceDto) {
    console.log('Received TTS Recreated:', data.id);
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const message = context.getMessage();
    const partition = context.getPartition();
    const offset = message.offset;
    await consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }])
    await this.lecturesService.handleTTSRecreated(data);
  }
}
