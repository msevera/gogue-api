import { forwardRef, Module } from '@nestjs/common';
import { LectureAgentController } from './lecture-agent.controller';
import { LectureAgentService } from './lecture-agent.service';
import { LectureAgentConfigService } from './lecture-agent-config.service';
import { UsersModule } from 'src/users/users.module';
import { LecturesModule } from 'src/lectures/lectures.module';
import { LectureAgentResolver } from './lecture-agent.resolver';
import { NotesModule } from 'src/notes/notes.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    forwardRef(() => LecturesModule),
    UsersModule, 
    NotesModule, 
    CategoriesModule,
  ],
  controllers: [LectureAgentController],
  providers: [LectureAgentService, LectureAgentConfigService, LectureAgentResolver],
  exports: [LectureAgentService]
})
export class LectureAgentModule {}
