import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GlimpsesService } from './glimpses.service';
import { UsersService } from '../users/users.service';

@Processor('glimpses')
export class GlimpsesConsumer extends WorkerHost {

  constructor(
    private readonly glimpsesService: GlimpsesService,
    private readonly usersService: UsersService
  ) { 
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {    
    switch (job.name) {
      case 'generate': {        
        const { userId, workspaceId } = job.data;
        console.log('Running job ==============================================', job.name, userId, workspaceId);
        const user = await this.usersService.findOne(null, userId, { throwErrorIfNotFound: false });
        const authContext = {
          user,
          workspaceId
        };

        await this.glimpsesService.callAgent(authContext);                
        console.log('Finished glimpse for user', userId);
        return {};
      }
    }
  }
}