export class SetOptions {
  expiration: number;
  tag?: string;
  tx: any;
}

export class WrapOptions<T> {
  expiration: number;
  tag: (resource: T) => string;
  tx: any;
}

