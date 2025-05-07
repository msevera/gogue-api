import { ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base-entity.type';

@ObjectType({ isAbstract: true }) 
export class CacheEntity extends BaseEntity {
  __fromCache?: boolean;
}