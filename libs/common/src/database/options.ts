import { ClientSession } from 'mongoose';
import { AuthContextType } from '../decorators/auth-context.decorator';

export enum SortOrder {
  DESC = -1,
  ASC = 1,
}

export class Sort<T> {
  by: keyof T | '_id';
  order: SortOrder;

  constructor(
    by: keyof T | '_id' = '_id' as keyof T,
    order: SortOrder = SortOrder.DESC,
  ) {
    this.by = by;
    this.order = order;
  }
}

export class ListOptions<T> {
  next?: number;
  prev?: number;
  limit?: number;
  maxLimit?: number;
  sort?: Sort<T>[];
}

export class LeanOptions {
  lean?: boolean;
}

export class SessionOptions {
  session?: ClientSession;
}
