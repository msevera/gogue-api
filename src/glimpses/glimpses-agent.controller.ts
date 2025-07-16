import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SsePost } from '@app/common/decorators/sse-post.decorator';
import { Body, Controller } from '@nestjs/common';
import { Observable } from 'rxjs';;
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { HumanMessage, isAIMessageChunk } from '@langchain/core/messages';
import { GlimpsesAgentService } from './glimpses-agent.service';

@Controller('users-topics-agent')
export class UsersTopicsAgentController {
  constructor(
    private readonly glimpsesAgentService: GlimpsesAgentService,

  ) { }

  // private getThreadId(authContext: AuthContextType) {
  //   return `${authContext.workspaceId}-${authContext.user.id}-${new Date().getTime()}`;
  // }

  @Auth(Role.CONSUMER)
  @SsePost('topics')
  async invoke(
    // @Body() glimpsesAgentInput: GlimpsesAgentService,
    @AuthContext() authContext: AuthContextType,
  ): Promise<Observable<MessageEvent>> {

    // const { input, threadId, store } = glimpsesAgentInput;
    // const thread_id = threadId || this.getThreadId(authContext);
    

    const eventStream = await this.glimpsesAgentService.graph.streamEvents(
      {
        
      },
      {
        configurable: {
          // thread_id,
          authContext,
          // input: input ? new HumanMessage(input) : null,
          // store,
        },
        version: 'v2',
      },
    );

    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          // subscriber.next({
          //   type: 'THREAD_ID',
          //   data: thread_id,
          // } as MessageEvent);

          for await (const item of eventStream) {
            const { event, name, data } = item;
            try {
              const isCustomEvent = event === 'on_custom_event';
              const isModelMessage = event === 'on_chat_model_stream' && isAIMessageChunk(data.chunk) && data.chunk.tool_call_chunks.length === 0;
              const isModelToolCall = event === 'on_chat_model_stream' && isAIMessageChunk(data.chunk) && data.chunk.tool_call_chunks.length !== 0;

              if (isCustomEvent || isModelMessage || isModelToolCall) {
                let eventName: string;
                let skip: boolean = false;
                let dataChunk: any = {};
                if (isModelMessage) {
                  eventName = 'MODEL_STREAM';
                  dataChunk.id = data.chunk.id;
                  dataChunk.type = 'model';
                  if (name === 'ChatAnthropic') {
                    const [contentItem] = data.chunk.content;
                    if (!contentItem || !contentItem.text) {
                      skip = true;
                    } else {
                      dataChunk.content = contentItem.text;
                    }
                  }

                  if (name === 'ChatOpenAI') {
                    if (!data.chunk.content) {
                      skip = true;
                    } else {
                      dataChunk.content = data.chunk.content;
                    }
                  }
                } else if (isModelToolCall) {
                  const [toolCallChunk] = data.chunk.tool_call_chunks;
                  if (!toolCallChunk.id || toolCallChunk.name === 'extract') {
                    skip = true;
                  } else {
                    eventName = 'MODEL_TOOL_CALL';
                    dataChunk.name = toolCallChunk.name;
                    dataChunk.id = toolCallChunk.id;
                    dataChunk.type = 'model_tool_call';
                  }
                } else {
                  eventName = name;
                  dataChunk = data.chunk;
                }


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
