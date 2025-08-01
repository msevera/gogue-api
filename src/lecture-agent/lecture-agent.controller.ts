import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SsePost } from '@app/common/decorators/sse-post.decorator';
import { Body, Controller } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LectureAgentInputDto } from './dto/lecture-agent-input.dto';
import { LectureAgentService } from './lecture-agent.service';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';

@Controller('lecture-agent')
export class LectureAgentController {
  constructor(
    private readonly lectureAgentService: LectureAgentService,

  ) { }

  private getThreadId(authContext: AuthContextType) {
    return `${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;
  }

  @Auth(Role.CONSUMER)
  @SsePost('create')
  async invoke(
    @Body() lectureAgentInput: LectureAgentInputDto,
    @AuthContext() authContext: AuthContextType,
  ): Promise<Observable<MessageEvent>> {

    const { input } = lectureAgentInput;
    const thread_id = this.getThreadId(authContext);
    const eventStream = await this.lectureAgentService.graph.streamEvents(
      {
        input
      },
      {
        configurable: {
          thread_id,
          authContext
        },
        version: 'v2',
      },
    );

    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          for await (const item of eventStream) {
            const { event, name, data } = item;
            try {
              const isCustomEvent = event === 'on_custom_event';
              if (isCustomEvent) {
                let eventName: string;
                let skip: boolean = false;
                let dataChunk: any = {};
                eventName = name;
                dataChunk = data.chunk;

                if (!skip) {
                  subscriber.next({
                    type: eventName,
                    data: dataChunk,
                  } as MessageEvent);
                }
              }
            } catch (error) {
              console.log('error', error)
            }
          }


          subscriber.next({
            type: 'DONE',
            data: 'DONE',
          } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          console.log('error', error)
          subscriber.next({
            type: 'DONE',
            data: 'DONE',
          } as MessageEvent);
          subscriber.error(error);
        }
      })();
    });
  }
}
