import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { LecturesService } from 'src/lectures/lectures.service';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { NotesService } from 'src/notes/notes.service';
import { prompt } from './prompts/config';

@Injectable()
export class NoteAgentConfigService {
  constructor(
    private notesService: NotesService,
    private configService: ConfigService,
  ) { }

  async getConfig(authContext: AuthContextType, id: string) {
   return null;
  }
}
