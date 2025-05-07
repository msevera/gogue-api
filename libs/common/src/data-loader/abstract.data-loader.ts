import * as DataLoader from 'dataloader'
import { AbstractRepository } from '@app/common/database/abstract.repository';
import { AbstractDocument } from '@app/common/database/abstract.entity';

export abstract class AbstractDataLoader<T extends AbstractDocument> {
  private findOneLoader: DataLoader<string, T>;

  constructor(private readonly repository: AbstractRepository<T>) {    
    this.findOneLoader = new DataLoader<string, T>(async (ids: readonly string[]) => {
      const resources = await this.repository.findIn(false, ids);
      return ids.map((id) => resources.find((s) => s.id === id));
    });
  }

  findOne(id: string) {
    return this.findOneLoader.load(id);
  }
}
