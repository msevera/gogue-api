import { Injectable } from '@nestjs/common';
import { Glimpse } from './entities/glimpse.entity';
import { AbstractService } from '@app/common/services/abstract.service';
import { GlimpsesRepository } from './glimpses.repository';

@Injectable()
export class GlimpsesService extends AbstractService<Glimpse> { 
  constructor(
    private readonly glimpsesRepository: GlimpsesRepository
  ) {
    super(glimpsesRepository);
  }
}