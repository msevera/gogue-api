import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { CacheEntity } from '@app/common/types/cache-entity.type';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';


@CustomSchema()
@ObjectType()
export class Category extends CacheEntity {
  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => [Number])
  @Prop({ required: false })
  nameEmbeddings?: number[];
}

export const CategoryEntity = SchemaFactory.createForClass(Category);

// vector index
// name_embeddings_cosine
// {
//   "fields": [{
//     "type": "vector",
//     "path": "nameEmbeddings",
//     "numDimensions": 1536,
//     "similarity": "cosine"
//   }]
// }