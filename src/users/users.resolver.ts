import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SetProfileDto } from './dto/set-profile.dto';
import { AuthContext, AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Auth } from '@app/common/decorators/auth.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Auth(Role.CONSUMER)
  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(null, id);
  }

  @Query(() => User, { name: 'signIn', nullable: true })
  async signIn(@Args('input') input: SignInDto) {
    return await this.usersService.signIn(input);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => User, { name: 'setProfile', nullable: true })
  async setProfile(@AuthContext() authContext: AuthContextType, @Args('input') input: SetProfileDto) {
    return this.usersService.setProfile(authContext.user.id, input);
  }
}
