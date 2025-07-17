import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Glimpse } from './entities/glimpse.entity';
import { GlimpsesService } from './glimpses.service';
import { GlimpseStatus } from './entities/glimpse-status.entity';
import { CustomSubscription } from '@app/common/subscriptions/custom-subscription.decorator';
import { GlimpseStatusUpdatedTopic } from './topics/glimpse-status-updated.topic';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { GlimpsesCursorDto } from './dto/glimpses-cursor.dto';
import { SetGlimpseViewedInputDto } from './dto/set-glimpse-viewed.dto';
import { GlimpsesReadyNotification } from './notifications/glimpses-ready.notification';
import { NotificationsService } from 'src/notifications/notifications.service';

@Resolver(() => Glimpse)
export class GlimpsesResolver {
  constructor(
    private readonly glimpsesService: GlimpsesService,
    private readonly pubSubService: PubSubService,
    private readonly notificationsService: NotificationsService
  ) { }

  @CustomSubscription<GlimpsesResolver, GlimpseStatus>(
    GlimpseStatusUpdatedTopic
  )
  glimpseStatusUpdated() {
    return this.pubSubService.subscribe(GlimpseStatusUpdatedTopic);
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

  @Auth(Role.CONSUMER)
  @Mutation(() => Boolean, { name: 'generateGlimpses' })
  async generateGlimpses(@AuthContext() authContext: AuthContextType) {
    await this.glimpsesService.callAgent(authContext)
    return true;
  }

  // @Auth(Role.CONSUMER)
  // @Mutation(() => Boolean, { name: 'testGlimpsesNotification' })
  // async testGlimpsesNotification(@AuthContext() authContext: AuthContextType) {
  //   const lastGlimpses = await this.findLatest(authContext);
  //   const [firstNewGlimpse] = lastGlimpses.items;
  //   await this.notificationsService.sendNotification(GlimpsesReadyNotification, authContext, firstNewGlimpse);
  //   return true;
  // }
}