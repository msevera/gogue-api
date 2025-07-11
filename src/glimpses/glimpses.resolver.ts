import { Resolver } from '@nestjs/graphql';
import { Glimpse } from './entities/glimpse.entity';

@Resolver(() => Glimpse)
export class GlimpsesResolver {
  constructor(
    private readonly glimpseService: GlimpseService
  ) {}

  @Query(() => Glimpse)
  async glimpse(@Args('id') id: string) {
    return this.glimpseService.findOne(id);
  }
}