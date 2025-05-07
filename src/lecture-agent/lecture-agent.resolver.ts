import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { LectureAgent } from './entities/lecture-agent.entity';
import { LectureAgentConfigService } from './lecture-agent-config.service';

@Resolver(() => LectureAgent)
export class LectureAgentResolver {
  constructor(private readonly lectureAgentConfigService: LectureAgentConfigService) {}

  @Auth(Role.CONSUMER)
  @Query(() => LectureAgent, { name: 'lectureAgent' })
  async config(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lectureAgentConfigService.getConfig(authContext, id);
  }
} 