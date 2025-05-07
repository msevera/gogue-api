import { NotFoundException } from '@nestjs/common';
import { AbstractDocument } from '../database/abstract.entity';
import { AbstractRepository } from '../database/abstract.repository';
import { AuthContextType } from '../decorators/auth-context.decorator';

export class findOneOptions {
  throwErrorIfNotFound: boolean;
}

export abstract class AbstractService<T extends AbstractDocument> {
  protected constructor(private readonly repository: AbstractRepository<T>) { }

  protected throwErrorIfNotFound(resource: T, options: findOneOptions = { throwErrorIfNotFound: true }) {
    if (!resource && options?.throwErrorIfNotFound) {
      throw new NotFoundException(
        `not_found`,
      );
    }
  }

  async findOne(
    authContext: AuthContextType | false,
    id: string,
    options?: findOneOptions,
  ) {
    const resource = await this.repository.findOne(authContext, { id } as Partial<T>);
    this.throwErrorIfNotFound(resource, options);

    return resource;
  }
}
