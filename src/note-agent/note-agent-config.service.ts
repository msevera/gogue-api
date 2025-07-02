import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { NotesService } from '../notes/notes.service';

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
