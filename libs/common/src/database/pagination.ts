export class PageInfo {
  hasPrev: boolean;
  prev: number | null;
  hasNext: boolean;
  next: number | null;
}

export class ListResult<T> {
  items: T[];
  pageInfo: PageInfo;
}
