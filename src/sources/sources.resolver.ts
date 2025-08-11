import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { SourceService } from './sources.service';
import { Source } from './entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { SourcesCursorDto } from './dto/sources-cursor.dto';
import { MatchedSourcesInputDto } from './dto/matched-sources.dto';



@Resolver(() => Source)
export class SourcesResolver {
  constructor(
    private readonly sourcesService: SourceService,
   
  ) { }

  // @Auth(Role.CONSUMER)
  @Mutation(() => Source, { name: 'createSource' })
  async createOne(
    @Args('input') input: CreateSourceDto,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.sourcesService.createOne(input);  
  }

  @Auth(Role.CONSUMER)
  @Query(() => SourcesCursorDto, { name: 'sourcesMatched' })
  async findMatched(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Source>,
    @Args('input', { nullable: true }) input: MatchedSourcesInputDto
  ) {
    return this.sourcesService.findMatched(input, pagination);
  }
} 