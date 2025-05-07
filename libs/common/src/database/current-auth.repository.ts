import { AbstractRepository } from "./abstract.repository";
import { AbstractDocument } from "./abstract.entity";
import { Injectable, Scope } from '@nestjs/common';
import { Model } from "mongoose";
import { BaseRepository } from './base.repository';
import { AuthContextType } from '../decorators/auth-context.decorator';

@Injectable()
export class CurrentAuthRepository<TDocument extends AbstractDocument> extends BaseRepository<TDocument> {
  protected constructor(
    protected readonly model: Model<TDocument>,
    protected type: { new(): TDocument },
  ) {
    super(model, type);
  }

  protected addCurrentAuthToQuery(
    authContext: AuthContextType | false,
    query: any,
    create: boolean = false
  ) {
    let updatedQuery = {
      ...query
    };
    if (authContext) {
      updatedQuery = {
        ...updatedQuery,
        userId: authContext.user.id,
        workspaceId: authContext.workspaceId
      }
    }

    return updatedQuery;
  }
}