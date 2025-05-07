import { Injectable } from '@nestjs/common';
import { Workspace } from './enitities/workspace.entity';
import { WorkspacesRepository } from './workspaces.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AbstractService } from '@app/common/services/abstract.service';

@Injectable()
export class WorkspacesService extends AbstractService<Workspace> {
  constructor(
    private workspacesRepository: WorkspacesRepository
  ) {
    super(workspacesRepository);
  }

  async create(createWorkspace: CreateWorkspaceDto): Promise<Workspace> {
    const result = await this.workspacesRepository.create(null, {
      name: createWorkspace.name,
      userId: createWorkspace.userId,
    });
    return result;
  }
}