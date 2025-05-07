import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { NoteAgent } from './entities/note-agent.entity';
import { NoteAgentConfigService } from './note-agent-config.service';

@Resolver(() => NoteAgent)
export class NoteAgentResolver {
  constructor(private readonly noteAgentConfigService: NoteAgentConfigService) {}

  @Auth(Role.CONSUMER)
  @Query(() => NoteAgent, { name: 'noteAgent' })
  async config(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.noteAgentConfigService.getConfig(authContext, id);
  }
} 