import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SetProfileDto } from './dto/set-profile.dto';
import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { SetTimezoneDto } from './dto/set-timezone.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService, @InjectQueue('glimpses') private glimpsesQueue: Queue) { }

  @Auth(Role.CONSUMER)
  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(null, id);
  }

  @Query(() => User, { name: 'signIn', nullable: true })
  async signIn(@Args('input') input: SignInDto) {
    const result =  await this.usersService.signIn(input);
    return result;
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => User, { name: 'setProfile', nullable: true })
  async setProfile(@AuthContext() authContext: AuthContextType, @Args('input') input: SetProfileDto) {
    return this.usersService.setProfile(authContext.user.id, input);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => User, { name: 'removeTopic', nullable: true })
  async removeTopic(@AuthContext() authContext: AuthContextType, @Args('input') input: SetProfileDto) {
    return this.usersService.setProfile(authContext.user.id, input);
  }


  @Auth(Role.CONSUMER)
  @Mutation(() => User, { name: 'setTimezone', nullable: true })
  async setTimezone(@AuthContext() authContext: AuthContextType, @Args('input') input: SetTimezoneDto) {
    return this.usersService.setTimezone(authContext.user.id, input);
  }

  async updateRepeatableJob(queue: Queue, jobId: string, newPattern: string) {
    // 1. Get the repeatable jobs
    const jobScheduler = await queue.getJobScheduler(jobId);

    if (jobScheduler) {
      // 3. Remove the existing repeatable job
      await queue.removeJobScheduler(jobScheduler.key);
      await queue.upsertJobScheduler(
        jobId, // Use the same id as before
        {
          pattern: newPattern,
        }, // Use the new cron pattern
        {
          name: 'generate',
          data: {
            userId: '686e6908ae4f642291a7c883',
            workspaceId: '686e6908ae4f642291a7c884',
          }
        } // Keep the same name and data
      );
      // 4. Add a new repeatable job with the updated pattern     
      console.log(`Repeatable job ${jobId} updated with pattern: ${newPattern}`);
    } else {
      console.log(`Repeatable job with id ${jobId} not found. Creating new job.`);
      await queue.upsertJobScheduler(
        jobId, // Use the same id as before
        {
          pattern: newPattern,
          immediately: true,
        }, // Use the new cron pattern
        {
          name: 'generate',
          data: {
            userId: '686e6908ae4f642291a7c883',
            workspaceId: '686e6908ae4f642291a7c884',
          }
        } // Keep the same name and data
      );
    }
  }
}
