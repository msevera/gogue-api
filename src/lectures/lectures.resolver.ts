import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { LecturesService } from './lectures.service';
import { Lecture, LectureCategory, LectureSection } from './entities/lecture.entity';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { LecturesCursorDto } from './dto/lectures-cursor.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { CustomSubscription } from '@app/common/subscriptions/custom-subscription.decorator';
import { PubSubService } from '../pubsub/pubsub.service';
import { LectureCreatingTopic } from './topics/lecture-creating.topic';
import { LectureAgentInputDto } from '../lecture-agent/dto/lecture-agent-input.dto';
import { LectureMetadata } from '../lecture-metadata/entities/lecture-metadata.entity';
import { DataLoaderRegistry } from 'src/data-loader/data-loader.registry';
import { Category } from 'src/categories/entities/category.entity';
import { LectureMetadataService } from 'src/lecture-metadata/lecture-metadata.service';
import { LectureMetadataStatus } from '@app/common/dtos/lecture-matadata-status.enum.dto';
import { FindLecturesInputDto } from './dto/find-lectures.dto';
import { SearchLecturesInputDto } from './dto/search-lectures.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { SortOrder } from '@app/common/database/options';

@Resolver(() => LectureSection)
export class LectureSectionResolver {
  @ResolveField('hasContent', () => Boolean)
  async hasContent(
    @Parent() section: LectureSection,
  ) {
    return section?.content?.length > 0;
  }
}

@Resolver(() => LectureCategory)
export class LectureCategoryResolver {
  @ResolveField('category', () => Category)
  async category(
    @Parent() item: LectureCategory,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry }
  ) {
    return dataLoaders.categories.findOne(item.categoryId.toString());
  }
}

@Resolver(() => Lecture)
export class LecturesResolver {
  constructor(
    private readonly lecturesService: LecturesService,
    private readonly pubSubService: PubSubService,
    private readonly lectureMetadataService: LectureMetadataService,
    private readonly notificationsService: NotificationsService
  ) { }

  @ResolveField('metadata', () => LectureMetadata)
  async metadata(
    @Parent() item: Lecture,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry },
    @AuthContext() authContext: AuthContextType
  ) {
    return dataLoaders.lectureMetadata.findOneWithAuth(authContext, item.id.toString());
  }

  @Query(() => LecturesCursorDto, { name: 'lectures' })
  async find(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @Args('input', { nullable: true }) input: FindLecturesInputDto
  ) {
    return this.lecturesService.find({
      ...input,
      creationEventName: 'DONE'
    }, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => LecturesCursorDto, { name: 'lecturesSearch' })
  async findSearch(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @Args('input', { nullable: true }) input: SearchLecturesInputDto,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lecturesService.findSearch(authContext, input, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => LecturesCursorDto, { name: 'lecturesAddedToLibrary' })
  async findAddedToLibrary(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lecturesService.findAddedToLibrary(authContext, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => LecturesCursorDto, { name: 'lecturesRecentlyPlayed' })
  async findRecentlyPlayed(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lecturesService.findRecentlyPlayed(authContext, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => LecturesCursorDto, { name: 'lecturesRecommended' })
  async findRecommended(
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Lecture>,
    @AuthContext() authContext: AuthContextType
  ) {
    // return this.lecturesService.findRecommended(authContext, pagination);
    return this.lecturesService.find({
      skipUserId: authContext.user.id,
      creationEventName: 'DONE'
    }, {
      limit: 15,
      sort: [{
        // @ts-ignore
        by: 'createdAt',
        order: SortOrder.DESC
      }]
    });
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
  @Query(() => Lecture, { name: 'pendingLectureShowNotification', nullable: true })
  async pendingLectureShowNotification(
    @AuthContext() authContext: AuthContextType
  ) {
    const lecture = await this.lecturesService.findOnePendingShowNotification(authContext);
    return lecture;
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Lecture, { name: 'setPendingLectureShowNotificationAsDone' })
  async setPendingLectureShowNotificationAsDone(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    const lecture = await this.lecturesService.setPendingLectureShowNotificationAsDone(authContext, id);
    return lecture;
  }

  @Query(() => Lecture, { name: 'lecture', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: string
  ) {
    return this.lecturesService.findOnePublic(id);
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
  @Mutation(() => LectureMetadata, { name: 'setPlaybackTimestamp' })
  async setPlaybackTimestamp(
    @Args('id', { type: () => ID }) id: string,
    @Args('timestamp', { type: () => Number }) timestamp: number,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lectureMetadataService.setPlaybackTimestamp(authContext, id, timestamp);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => LectureMetadata, { name: 'setStatus' })
  async setStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => LectureMetadataStatus }) status: LectureMetadataStatus,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lectureMetadataService.setStatus(authContext, id, status);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => LectureMetadata, { name: 'addToLibrary' })
  async addToLibrary(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lectureMetadataService.addToLibrary(authContext, id);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => LectureMetadata, { name: 'removeFromLibrary' })
  async removeFromLibrary(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.lectureMetadataService.removeFromLibrary(authContext, id);
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

  // @Auth(Role.CONSUMER)
  // @Mutation(() => Lecture, { name: 'markLectureAsReady' })
  // async markAsReady(
  //   @Args('id', { type: () => ID }) id: string,
  //   @Args('state', { type: () => String }) state: string,
  //   @Args('showNotification', { type: () => Boolean, nullable: true }) showNotification: boolean,
  //   @AuthContext() authContext: AuthContextType
  // ) {
  //   const lecture = await this.lecturesService.markAsReady(authContext, id, state, showNotification);
  //   return lecture;
  // }

  // @Auth(Role.CONSUMER)
  // @Mutation(() => Boolean, { name: 'testLectureNotification' })
  // async testLectureNotification(@AuthContext() authContext: AuthContextType, @Args('id', { type: () => ID }) id: string) {
  //   const lecture = await this.lecturesService.findOnePublic(authContext, id);

  //   await this.notificationsService.sendNotification(LectureCreatedNotification, authContext, lecture);
  //   return true;
  // }

  @CustomSubscription<LecturesResolver, Lecture>(
    LectureCreatingTopic
  )
  lectureCreating() {
    return this.pubSubService.subscribe(LectureCreatingTopic);
  }
} 