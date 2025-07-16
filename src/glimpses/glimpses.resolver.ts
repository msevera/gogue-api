import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Glimpse } from './entities/glimpse.entity';
import { GlimpsesService } from './glimpses.service';
import { GlimpseStatus } from './entities/glimpse-status.entity';
import { CustomSubscription } from '@app/common/subscriptions/custom-subscription.decorator';
import { GlimpseStatusUpdatedTopic } from './topics/glimpse-status-updated.topic';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { GlimpsesCursorDto } from './dto/glimpses-cursor.dto';
import { SetGlimpseViewedInputDto } from './dto/set-glimpse-viewed.dto';

@Resolver(() => Glimpse)
export class GlimpsesResolver {
  constructor(
    private readonly glimpsesService: GlimpsesService,
    private readonly pubSubService: PubSubService,
    @InjectQueue('glimpses') private glimpsesQueue: Queue
  ) { }

  @CustomSubscription<GlimpsesResolver, GlimpseStatus>(
    GlimpseStatusUpdatedTopic
  )
  glimpseStatusUpdated() {
    return this.pubSubService.subscribe(GlimpseStatusUpdatedTopic);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Boolean)
  async generateGlimpses(@AuthContext() authContext: AuthContextType) {
    await this.glimpsesService.callAgent(authContext)
    return true;
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Glimpse, { name: 'setGlimpseViewed' })
  async setViewed(
    @AuthContext() authContext: AuthContextType,  
    @Args('input') input: SetGlimpseViewedInputDto,
  ) {
    await this.glimpsesService.setGlimpseViewed(authContext, input)
    return true;
  }

  @Auth(Role.CONSUMER)
  @Query(() => GlimpsesCursorDto, { name: 'glimpsesLatest' })
  async findLatest(
    @AuthContext() authContext: AuthContextType
  ) {
    return this.glimpsesService.findLatest(authContext);
  }

  @Auth(Role.CONSUMER)
  @Query(() => GlimpseStatus, { name: 'checkGlimpsesStatus' })
  async checkStatus(
    @AuthContext() authContext: AuthContextType
  ) {
    return this.glimpsesService.checkGlimpseStatus(authContext);
  }
}