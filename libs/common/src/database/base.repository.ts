import { AbstractRepository } from "./abstract.repository";
import { AbstractDocument } from "./abstract.entity";
import { Injectable, Scope } from '@nestjs/common';
import { Model } from "mongoose";

@Injectable()
export class BaseRepository<TDocument extends AbstractDocument> extends AbstractRepository<TDocument> {
  protected constructor(
    protected readonly model: Model<TDocument>,
    protected type: { new(): TDocument }
  ) {
    super(model, type);
  }
}