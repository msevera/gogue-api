import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import { CacheEntity } from '@app/common/types/cache-entity.type';
import { Category } from 'src/categories/entities/category.entity';
import mongoose from 'mongoose';

@Schema({ _id: false })
@ObjectType()
export class SourceSection {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;
}

@Schema({ _id: false })
@ObjectType()
export class SourceImage {   
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  url?: string;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  width?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  height?: number;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  mimeType?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  extension?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  color?: string;
}

@Schema({ _id: false })
@ObjectType()
export class SourceCategory {
  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  categoryId: string;

  @Field(() => Category)
  category?: Category;
}

@CustomSchema()
@ObjectType()
export class Source extends CacheEntity {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  topic?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  internalDescription?: string;

  @Field(() => [Number], { nullable: true })
  @Prop({ required: false })
  internalDescriptionEmbeddings?: number[];  

  @Field(() => SourceImage, { nullable: true })
  @Prop({ required: false, type: SourceImage })
  image?: SourceImage;

  @Field(() => [String], { nullable: true })
  @Prop({ required: false })
  authors?: string[];

  @Field(() => [SourceCategory], { nullable: true })
  @Prop({ required: false, type: [SourceCategory] })
  categories?: SourceCategory[];

  @Field(() => [SourceSection], { nullable: true })
  @Prop({ type: [SourceSection] })
  sections?: SourceSection[];

  @Field(() => [String], { nullable: true })
  @Prop({ required: false })
  keyInsights?: string[];

  @Field(() => [String], { nullable: true })
  @Prop({ required: false })
  keyTakeaways?: string[];
}

export const SourceEntity = SchemaFactory.createForClass(Source);

// vector index
// internal_description_embeddings_cosine
// {
//   "fields": [{
//     "type": "vector",
//     "path": "internalDescriptionEmbeddings",
//     "numDimensions": 1536,
//     "similarity": "cosine"
//   }]
// }