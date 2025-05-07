import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace } from './enitities/workspace.entity';
import { BaseRepository } from '@app/common/database/base.repository';

export class WorkspacesRepository extends BaseRepository<Workspace> {
  constructor(
    @InjectModel(Workspace.name)
    workspacesModel: Model<Workspace>,
  ) {
    super(workspacesModel, Workspace);
  }
}
