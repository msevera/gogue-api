import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { LecturesService } from './lectures.service';
import { Lecture, LectureSection } from './entities/lecture.entity';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { LecturesCursorDto } from './dto/lectures-cursor.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';

import { CustomSubscription } from '@app/common/subscriptions/custom-subscription.decorator';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { LectureCreatingTopic } from './topics/lecture-creating.topic';
import { LectureAgentInputDto } from 'src/lecture-agent/dto/lecture-agent-input.dto';
import { LectureMetadata } from 'src/lecture-metadata/entities/lecture-metadata.entity';
import { DataLoaderRegistry } from 'src/data-loader/data-loader.registry';



@Resolver(() => LectureSection)
export class LectureSectionResolver {
  @ResolveField('hasContent', () => Boolean)
  async hasContent(
    @Parent() section: LectureSection,
  ) {
    return section?.content?.length > 0;
  }
}

@Resolver(() => Lecture)
export class LecturesResolver {
  constructor(
    private readonly lecturesService: LecturesService,
    private readonly pubSubService: PubSubService
  ) { }

  @ResolveField('metadata', () => LectureMetadata)
  async metadata(
    @Parent() item: Lecture,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry },
    @AuthContext() authContext: AuthContextType
  ) {
    return dataLoaders.lectureMetadata.findOneWithAuth(authContext, item.id.toString());
  }

  @Auth(Role.CONSUMER)
  @Query(() => LecturesCursorDto, { name: 'lectures' })
  async find(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lecturesService.find(authContext, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => Lecture, { name: 'pendingLecture', nullable: true })
  async pendingLecture(
    @AuthContext() authContext: AuthContextType
  ) {
    const lecture = await this.lecturesService.findOnePending(authContext);
    return lecture;
  }

  @Auth(Role.CONSUMER)
  @Query(() => Lecture, { name: 'lecture', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lecturesService.findOne(authContext, id);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Boolean, { name: 'createLectureAsync' })
  async createOneAsync(
    @Args('input') input: LectureAgentInputDto,
    @AuthContext() authContext: AuthContextType
  ) {
    this.lecturesService.callAgent(authContext, input);
    return true;
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Boolean, { name: 'deleteLecture' })
  async deleteLecture(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    await this.lecturesService.deleteOne(authContext, id);
    return true;
  }

  // @Auth(Role.CONSUMER)
  @Mutation(() => Boolean, { name: 'generateAudio' })
  async generateAudio(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    await this.lecturesService.generateAudio(authContext, id);
    return true;
  }

  @CustomSubscription<LecturesResolver, Lecture>(
    LectureCreatingTopic
  )
  lectureCreating() {
    return this.pubSubService.subscribe(LectureCreatingTopic);
  }
} 