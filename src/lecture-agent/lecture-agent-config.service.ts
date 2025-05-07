import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { LecturesService } from 'src/lectures/lectures.service';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { startFromBeginningPrompt, continueFromCheckpointPrompt, checkpointPrompt } from './prompts/config';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class LectureAgentConfigService {
  constructor(
    private lecturesService: LecturesService,
    private configService: ConfigService,
  ) { }

  async getConfig(authContext: AuthContextType, id: string) {
    const lecture = await this.lecturesService.findOne(authContext, id);
    const lectureContent = `# ${lecture.title}\n\n${lecture.sections.map(section => `## ${section.title}\n${section.content}`).join('\n\n')}`;

    const systemPromptTemplate =
      SystemMessagePromptTemplate.fromTemplate(lecture.checkpoint ? continueFromCheckpointPrompt : startFromBeginningPrompt);
    const systemPromptResult = await systemPromptTemplate.invoke({
      LECTURE: lectureContent,
      CHECKPOINT: lecture.checkpoint
    });
    const [systemPromptMessage] = systemPromptResult;

    const config = {
      "voice": {
        "model": "eleven_turbo_v2_5",
        "voiceId": "JBFqnCBsd6RMkjVDRZzb",
        "provider": "11labs",
        "stability": 0.5,
        "similarityBoost": 0.75
      },
      "model": {
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content": systemPromptMessage.content
          }
        ],
        "provider": "openai",
        "maxTokens": 4096,
        "temperature": 0.5,
        "tools": [
          {
            "type": "endCall"
          },
          {
            "type": "function",
            "async": true,
            "function": {
              "name": "create_note",
              "parameters": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "Extracted title of the note"
                  },
                  "content": {
                    "type": "string",
                    "description": "Summarized content of the note"
                  }
                }
              },
              "description": "Creates new note for the lecture from current reading context. Rephrase and summarize the content of the note."
            },
          }
        ]
      },
      "firstMessageMode": "assistant-speaks-first-with-model-generated-message",
      "transcriber": {
        "model": "nova-3",
        "language": "en",
        "numerals": false,
        "provider": "deepgram",
        "endpointing": 300,
        "confidenceThreshold": 0.4
      },
      "clientMessages": [
        "transcript",
        "function-call",
        "tool-calls",       
      ],
      "serverMessages": [
        "end-of-call-report",
        "function-call",
        "tool-calls"
      ],
      "server": {
        "url": `${this.configService.get('API_ENDPOINT')}/lecture-agent/agent-message`,
        "headers": {
          "x-lecture-id": lecture.id,
          "x-user-id": authContext.user.id,
          "x-workspace-id": authContext.workspaceId
        }
      },   
      "hipaaEnabled": false,
      "backchannelingEnabled": false,
      "backgroundDenoisingEnabled": false,
      "startSpeakingPlan": {
        "waitSeconds": 0.4,
        "transcriptionEndpointingPlan": {
          "onPunctuationSeconds": 0.1,
          "onNoPunctuationSeconds": 1.5,
          "onNumberSeconds": 0.5
        },
        "smartEndpointingEnabled": "livekit"
      }
    };

    return {
      config: JSON.stringify(config)
    }
  }
}
