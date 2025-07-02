import { Args, Context, ID, Mutation, Query, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { NotesCursorDto } from './dto/notes-cursor.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { Lecture } from '../lectures/entities/lecture.entity';
import { DataLoaderRegistry } from '../data-loader/data-loader.registry';
import { PubSubService } from '../pubsub/pubsub.service';
import { CreateNoteInputDto } from './dto/create-note.dto';
import { FindNotesInputDto } from './dto/find-notes.dto';
import { NoteCreatedTopic } from './topics/note-created.topic';
import { CustomSubscription } from '@app/common/subscriptions/custom-subscription.decorator';

@Resolver(() => Note)
export class NotesResolver {
  constructor(private readonly notesService: NotesService, private readonly pubSubService: PubSubService) { }

  @ResolveField('lecture', () => Lecture)
  async lecture(
    @Parent() item: Note,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry },
  ) {
    return dataLoaders.lectures.findOne(item.lectureId.toString());
  }

  @Auth(Role.CONSUMER)
  @Query(() => NotesCursorDto, { name: 'notes' })
  async find(
    @Args('input') input: FindNotesInputDto,
    @Args('pagination', { nullable: true }) pagination: PaginationDto<Note>,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.notesService.find(authContext, input, pagination);
  }

  @Auth(Role.CONSUMER)
  @Query(() => Note, { name: 'note', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.notesService.findOne(authContext, id);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Note, { name: 'deleteNote' })
  async deleteOne(
    @Args('id', { type: () => ID }) id: string,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.notesService.deleteOne(authContext, id);
  }

  @Auth(Role.CONSUMER)
  @Mutation(() => Note, { name: 'createNote' })
  async createOne(
    @Args('input') input: CreateNoteInputDto,
    @AuthContext() authContext: AuthContextType
  ) {
    return await this.notesService.createOne(authContext, input);    
  }

  @CustomSubscription<NotesResolver, Note>(
    NoteCreatedTopic,
    (resolver: NotesResolver, payload: Note, variables: any) => {
      return payload.lectureId === variables.lectureId;
    }
  )
  noteCreated(@Args('lectureId', { type: () => ID }) lectureId: string) {
    return this.pubSubService.subscribe(NoteCreatedTopic);
  }
} 