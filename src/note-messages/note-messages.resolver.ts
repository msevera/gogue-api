import { Args, Context, ID, Mutation, Query, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { Auth } from '@app/common/decorators/auth.decorator';
import { AuthContext } from '@app/common/decorators/auth-context.decorator';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { Role } from '@app/common/dtos/role.enum.dto';
import { NoteMessagesCursorDto } from './dto/note-messages-cursor.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { NoteMessagesService } from './note-messages.service';
import { NoteMessage } from './entities/note-message.entity';
import { DataLoaderRegistry } from 'src/data-loader/data-loader.registry';
import { Note } from 'src/notes/entities/note.entity';
import { FindNoteMessagesDto } from './dto/find-note-messages.dto';

@Resolver(() => NoteMessage)
export class NoteMessagesResolver {
  constructor(private readonly noteMessagesService: NoteMessagesService) { }

  @ResolveField('note', () => Note)
  async note(
    @Parent() item: NoteMessage,
    @Context() { dataLoaders }: { dataLoaders: DataLoaderRegistry },
  ) {
    return dataLoaders.notes.findOne(item.noteId.toString());
  }

  @Auth(Role.CONSUMER)
  @Query(() => NoteMessagesCursorDto, { name: 'noteMessages' })
  async find(
    @Args('input') input: FindNoteMessagesDto,
    @Args('pagination', { nullable: true }) pagination: PaginationDto<NoteMessage>,
    @AuthContext() authContext: AuthContextType
  ) {
    return this.noteMessagesService.find(authContext, input, pagination);
  }
} 