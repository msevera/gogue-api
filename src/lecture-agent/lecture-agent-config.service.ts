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
    return null;
  }
}
