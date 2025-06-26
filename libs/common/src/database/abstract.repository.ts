import { FilterQuery, Model, RootFilterQuery, UpdateQuery } from 'mongoose';
import { AbstractDocument } from '@app/common/database/abstract.entity';
import {
  LeanOptions,
  ListOptions,
  SessionOptions,
} from '@app/common/database/options';
import { BadRequestException, Inject } from '@nestjs/common';
import { ListResult, PageInfo } from '@app/common/database/pagination';
import { CacheService } from '../../../../src/cache/cache.service';
import { CACHE } from '../constants/cache.constants';
import { AuthContextType } from '../decorators/auth-context.decorator';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  public cacheTTL = 60 * 60 * 2;

  get name() {
    return this.model.modelName;
  }

  @Inject(CACHE)
  protected readonly cacheManager: CacheService;

  protected constructor(
    protected readonly model: Model<TDocument>,
    protected type: { new(): TDocument }
  ) {

  }

  private sortObjectProperties(obj: Record<string, any>): Record<string, any> {
    const sortedObj: Record<string, any> = {};

    Object.keys(obj)
      .sort()
      .forEach((key) => {
        if (
          obj[key] &&
          typeof obj[key] === 'object' &&
          !Array.isArray(obj[key])
        ) {
          sortedObj[key] = this.sortObjectProperties(obj[key]);
        } else {
          sortedObj[key] = obj[key];
        }
      });

    return sortedObj;
  }

  protected cleanQuery(query: any): FilterQuery<TDocument> {
    return Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined)
    ) as FilterQuery<TDocument>;
  }

  protected addCurrentAuthToQuery(
    authContext: AuthContextType | false,
    query: any,
    create: boolean = false
  ) {   
    return query;
  }

  private buildFilterQuery(
    filter: RootFilterQuery<TDocument> & { id?: string },
  ) {
    const { id, ...rest } = filter;
    const query: any = {
      ...rest,
    };

    if (id) {
      query._id = id;
    }

    return query;
  }

  private async _wrap(
    authContext: AuthContextType | false,
    filter,
    wrap,
    tx?: any
  ): Promise<TDocument> {
    const filterQuery = this.buildFilterQuery(filter);
    const cleanQuery = this.cleanQuery(filterQuery);
    const query = this.addCurrentAuthToQuery(authContext, cleanQuery);    
    const cacheKey = `${this.name}:${this.serializeSorted(query)}`;

    return await this.cacheManager.wrap<TDocument>(
      this.type,
      cacheKey,
      wrap.bind(this.cacheManager, query),
      {
        expiration: this.cacheTTL,
        tag: (resource) => this.buildCacheTag(resource),
        tx,
      },
    );
  }

  protected handleCommonOptions(
    pipe: any,
    options: LeanOptions & SessionOptions,
  ) {
    if (options.session) {
      pipe = pipe.session(options.session);
    }

    if (options.lean) {
      pipe = pipe.lean({ virtuals: true, defaults: true, getters: true });
    }

    return pipe;
  }

  protected async clearResourceFromCache(resource: TDocument, tx?: any) {
    await this.cacheManager.delTag(this.buildCacheTag(resource), tx);
  }

  protected serializeSorted(obj: Record<string, any>): string {
    const sortedObj = this.sortObjectProperties(obj);
    return JSON.stringify(sortedObj);
  }

  protected checkLimit(options: ListOptions<TDocument>) {
    if (options.limit > options.maxLimit) {
      throw new BadRequestException(
        `Limit should not exceed ${options.maxLimit} items`,
      );
    }

    if (!options.limit) {
      options.limit = 30;
    }

    if (!options.next) {
      options.next = 0;
    }
  }

  protected async findWithFilter(
    authContext: AuthContextType | false,
    query: FilterQuery<TDocument>,
    options: ListOptions<TDocument> & LeanOptions & SessionOptions = {
      next: null,
      prev: null,
      sort: [],
      lean: true,
    },
  ): Promise<ListResult<TDocument>> {
    this.checkLimit(options);

    const cleanQuery = this.cleanQuery(query);
    const queryWithAuth = this.addCurrentAuthToQuery(authContext, cleanQuery);
    
    let pipe = this.model.find(queryWithAuth);

    if (options.sort && options.sort.length > 0) {
      pipe = pipe.sort(
        options.sort.reduce((result, item) => {
          result = {
            ...result,
            [item.by]: item.order,
          };
          return result;
        }, {}),
      );
    } else {
      pipe = pipe.sort({
        _id: 1,
      });
    }

    if (options.next !== null) {
      pipe = pipe.skip(options.next * options.limit).limit(options.limit + 1);
    }

    pipe = await this.handleCommonOptions(pipe, options);

    const result = await pipe;
    const hasNext = result.length > options.limit;
    const items = hasNext ? result.slice(0, result.length - 1) : result;


    return this.wrapIntoCursor(items, {
      hasPrev: false,
      prev: null,
      hasNext,
      next: hasNext ? (options.next || 0) + 1 : null,
    });
  }

  protected wrapIntoCursor(items: TDocument[], pageInfo: PageInfo) {
    return {
      items,
      pageInfo,
    };
  }

  buildCacheTag(resource: TDocument) {
    return `Tag:${this.name}:${resource.id}`;
  }

  async find(
    authContext: AuthContextType | false,
    query?: any,
    options?: ListOptions<TDocument>,
  ): Promise<ListResult<TDocument>> {
    return this.findWithFilter(authContext, query, options);
  }

  async createMany(
    authContext: AuthContextType | false,
    documents: Omit<TDocument, 'id' | 'userId' | 'workspaceId'>[],
    options: SessionOptions = {},
  ): Promise<TDocument[]> {

    const documentsWithAuth = documents.map(document => this.addCurrentAuthToQuery(authContext, document, true));

    const resources = await this.model.create(documentsWithAuth, {
      session: options.session,
    });

    return Promise.all(resources.map(async resource => (
      await this._wrap(
        authContext,
        { id: resource.id } as TDocument,
        async () =>
          resource.toObject({
            virtuals: true,
            getters: true,
          }) as TDocument,
      ))));
  }

  async create(
    authContext: AuthContextType | false,
    document: Omit<TDocument, 'id'>, //& Partial<Pick<TDocument, 'userId' | 'workspaceId'>>,
    options: SessionOptions = {},
  ): Promise<TDocument> {
    const documentWithAuth = this.addCurrentAuthToQuery(authContext, document, true);
    const [resource] = await this.model.create([documentWithAuth], {
      session: options.session,
    });

    // return resource.toObject({
    //   virtuals: true,
    //   getters: true,
    // }) as TDocument;

    return (await this._wrap(
      authContext,
      { id: resource.id } as TDocument,
      async () =>
        resource.toObject({
          virtuals: true,
          getters: true,
        }) as TDocument,
    )) as TDocument;
  }

  async updateOne(
    authContext: AuthContextType | false,
    filter: RootFilterQuery<TDocument> & { id?: string },
    update: UpdateQuery<TDocument>,
    options: SessionOptions = {},
  ): Promise<TDocument> {
    const filterQuery = this.buildFilterQuery(filter);
    const cleanQuery = this.cleanQuery(filterQuery);
    const query = this.addCurrentAuthToQuery(authContext, cleanQuery);    
    
    const resource = await this.model.findOneAndUpdate(query, update, {
      runValidators: false,
      new: true,
      session: options.session,
    });

    // const tx = await this.cacheManager.createTx();
    const tx = null;

    await this.clearResourceFromCache(resource, tx);

    // return resource.toObject({
    //   virtuals: true,
    //   getters: true,
    // }) as TDocument;

    const result = (await this._wrap(
      authContext,
      { id: resource.id } as TDocument,
      async () =>
        // (await this.model.findOne(query)).toObject({
        //   virtuals: true,
        //   getters: true,
        // }) as TDocument,
        resource.toObject({
          virtuals: true,
          getters: true,
        }) as TDocument,
      tx
    )) as TDocument;

    // await tx.exec();

    return result;
  }

  async updateMany(
    authContext: AuthContextType | false,
    filter: RootFilterQuery<TDocument> & { id?: string },
    update: UpdateQuery<TDocument>,
    options: SessionOptions = {},
  ): Promise<void> {
    const filterQuery = this.buildFilterQuery(filter);
    const cleanQuery = this.cleanQuery(filterQuery);
    const query = this.addCurrentAuthToQuery(authContext, cleanQuery);    
    
    await this.model.updateMany(
      query,
      update,
      { runValidators: false, new: true, session: options.session },
    );

    const resources = await this.model.find(query);
    for (const res of resources) {
      await this.clearResourceFromCache(res);
    }
  }

  async findOne(
    authContext: AuthContextType | false,
    filter: Partial<TDocument>,
    options: LeanOptions & SessionOptions = { lean: true },
  ): Promise<TDocument> {
    return await this._wrap(authContext, filter, async (query) => {
      const pipe = this.model.findOne(query);
      const resource = await this.handleCommonOptions(pipe, options);
      const res = resource as TDocument;
      return res;
    });
  }

  async findIn(
    authContext: AuthContextType | false,
    ids: readonly string[],
    options: LeanOptions & SessionOptions = { lean: true },
  ): Promise<TDocument[]> {
    const resources = await this.findWithFilter(
      authContext,
      {
        _id: {
          $in: ids,
        },
      },
      {
        lean: options.lean,
        session: options.session,
      },
    );

    return resources.items;
  }

  async deleteOne(
    authContext: AuthContextType | false,
    filter: Partial<TDocument>,
    options: LeanOptions & SessionOptions = { lean: true },
  ): Promise<TDocument> {
    const filterQuery = this.buildFilterQuery(filter);
    const cleanQuery = this.cleanQuery(filterQuery);
    const query = this.addCurrentAuthToQuery(authContext, cleanQuery);
    
    const resource = await this.model.findOne(query);
    await this.model.deleteOne(query).session(options.session);
    await this.clearResourceFromCache(resource);

    return resource;
  }

  async deleteMany(
    authContext: AuthContextType | false,
    filter: Partial<TDocument>,
    options: LeanOptions & SessionOptions = { lean: true },
  ): Promise<boolean> {
    const filterQuery = this.buildFilterQuery(filter);
    const cleanQuery = this.cleanQuery(filterQuery);
    const query = this.addCurrentAuthToQuery(authContext, cleanQuery);
    await this.model.deleteMany(query).session(options.session);    
    return true;
  }
}
