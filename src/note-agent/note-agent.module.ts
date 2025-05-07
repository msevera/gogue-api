import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { NotesModule } from 'src/notes/notes.module';
import { NoteAgentConfigService } from './note-agent-config.service';
import { NoteAgentResolver } from './note-agent.resolver';

@Module({
  imports: [UsersModule, NotesModule],
  providers: [NoteAgentConfigService, NoteAgentResolver],
})
export class NoteAgentModule {}
