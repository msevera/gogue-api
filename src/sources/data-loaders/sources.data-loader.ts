import { SourceRepository } from '../sources.repository';
import { Source } from '../entities/source.entity';
import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';

export class SourceDataLoader extends AbstractDataLoader<Source> {
  constructor(private readonly sourcesRepository: SourceRepository) {
    super(sourcesRepository);
  }
}
