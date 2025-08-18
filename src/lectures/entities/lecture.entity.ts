import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../../src/users/entities/user.entity';
import { CustomSchema } from '@app/common/database/custom-schema.decorator';
import mongoose from 'mongoose';
import { WorkspaceEntity } from '@app/common/types/workspace-entity.type';
import { LectureCreationEvent } from '../dto/lecture-event.dto';
import { LectureMetadata } from '../../../src/lecture-metadata/entities/lecture-metadata.entity';
import { Category } from '../../../src/categories/entities/category.entity';
import { Source } from 'src/sources/entities/source.entity';
import slugify from 'slug';


export type LectureDocument = Lecture & mongoose.Document;

@Schema({ _id: false })
@ObjectType()
export class LectureSectionAnnotation {
  @Field(() => Number)
  @Prop({ required: true })
  startIndex: number;

  @Field(() => Number)
  @Prop({ required: true })
  endIndex: number;

  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String)
  @Prop({ required: true })
  type: string;

  @Field(() => String)
  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
@ObjectType()
export class LectureSection {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  content?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;

  @Field(() => Boolean)
  hasContent?: boolean;

  @Field(() => [LectureSectionAnnotation], { nullable: true })
  @Prop({ required: false, type: [LectureSectionAnnotation] })
  annotations?: LectureSectionAnnotation[];
}

@Schema({ _id: false })
@ObjectType()
export class LectureResearchSection {
  @Field(() => String)
  @Prop({ required: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  description?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  category?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  content?: string;

  @Field(() => Boolean)
  hasContent?: boolean;

  @Field(() => [LectureSectionAnnotation], { nullable: true })
  @Prop({ required: false, type: [LectureSectionAnnotation] })
  annotations?: LectureSectionAnnotation[];
}

@Schema({ _id: false })
@ObjectType()
export class Audio {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  stream?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  wav?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  folder?: string;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  duration?: number;

  @Field(() => [Number], { nullable: true })
  @Prop({ required: false })
  bars?: number[];
}

@Schema({ _id: false })
@ObjectType()
export class Aligners {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  mfa?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  text?: string;
}

@Schema({ _id: false })
@ObjectType()
export class Image {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  prompt?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  webp?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  png?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  folder?: string;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  width?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  height?: number;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  color?: string;
}

@Schema({ _id: false })
@ObjectType()
export class LectureCategory {
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

@Schema({ _id: false })
@ObjectType()
export class WorkbookTask {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  prompt?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  instructions?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  expectedFormat?: string;
}

@CustomSchema()
@ObjectType()
export class Lecture extends WorkspaceEntity {
  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  slug?: string;

  @Field(() => String)
  @Prop({ required: true })
  input: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  topic?: string;

  @Prop({ required: false })
  topicEmbeddings?: number[];

  @Field(() => [LectureCategory], { nullable: true })
  @Prop({ required: false, type: [LectureCategory] })
  categories?: LectureCategory[];

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  title?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  overview?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  emoji?: string;

  @Field(() => User)
  user?: User;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value.toString();
    },
    required: true,
  })
  userId: string;

  @Field(() => [LectureSection])
  @Prop({ type: [LectureSection] })
  sections: LectureSection[];

  @Field(() => LectureCreationEvent, { nullable: true })
  @Prop({ type: LectureCreationEvent })
  creationEvent?: LectureCreationEvent;

  @Field(() => Audio, { nullable: true })
  @Prop({ required: false, type: Audio })
  audio?: Audio;

  @Field(() => Aligners, { nullable: true })
  @Prop({ required: false, type: Aligners })
  aligners?: Aligners;

  @Field(() => LectureMetadata, { nullable: true })
  metadata?: LectureMetadata;

  @Field(() => Image, { nullable: true })
  @Prop({ required: false, type: Image })
  image?: Image;

  @Field(() => Boolean)
  @Prop({ required: true, default: true })
  isPublic?: boolean;

  @Field(() => String, { nullable: true })
  @Prop({ required: false, default: 'en' })
  languageCode?: string;

  @Field(() => [LectureResearchSection], { nullable: true })
  @Prop({ type: [LectureResearchSection] })
  research?: LectureResearchSection[];

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  voiceInstructions?: string;

  @Field(() => Source, { nullable: true })
  @Prop({ type: Source })
  source?: Source;

  @Field(() => ID, { nullable: true })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    get: (value: mongoose.Schema.Types.ObjectId) => {
      return value?.toString();
    },
    required: false,
  })
  sourceId?: string;

  @Field(() => [String], { nullable: true })
  @Prop({ required: false })
  keyInsights?: string[];

  @Field(() => [WorkbookTask], { nullable: true })
  @Prop({ required: false })
  workbook?: WorkbookTask[];
}

export const LectureEntity = SchemaFactory.createForClass(Lecture);
LectureEntity.index({ slug: 1 });

async function generateUniqueSlug(this: any, topic: string, excludeId?: string) {
  const baseSlug = slugify(topic, { lower: true });

  // Determine the correct Model depending on whether we're in document or query middleware
  const LectureModel =
    typeof this.getQuery === 'function' && this.model
      ? this.model
      : this.constructor;

  // Find all existing slugs starting with baseSlug
  const existing = await LectureModel.find({
    slug: { $regex: `^${baseSlug}(-[0-9]+)?$`, $options: 'i' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select('slug');

  if (!existing.length) return baseSlug;

  let maxNum = 0;
  for (const doc of existing) {
    // Only consider slugs that start with the baseSlug
    if (doc.slug?.toLowerCase().startsWith(baseSlug.toLowerCase())) {
      const match = doc.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`, 'i'));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  return `${baseSlug}-${maxNum + 1}`;
}

// ====== CREATE ======
LectureEntity.pre<LectureDocument>('save', async function (next) {
  if (this.isModified('topic')) {
    this.slug = await generateUniqueSlug.call(this, this.topic, this._id.toString());
  }
  next();
});

// ====== UPDATE ======
async function updateSlugInQuery(this: any, next: Function) {
  const update = this.getUpdate();
  if (!update) return next();

  // Handle both $set.topic and direct topic updates
  const topic = update.topic ?? update.$set?.topic;
  if (topic) {
    const newSlug = await generateUniqueSlug.call(this, topic, this.getQuery()._id?.toString());
    if (update.$set) {
      update.$set.slug = newSlug;
    } else {
      update.slug = newSlug;
    }
    this.setUpdate(update);
  }
  next();
}

LectureEntity.pre('findOneAndUpdate', updateSlugInQuery);
LectureEntity.pre('updateOne', updateSlugInQuery);
LectureEntity.pre('updateMany', updateSlugInQuery);

// vector index
// topic_embeddings_cosine
// {
//   "fields": [{
//     "type": "vector",
//     "path": "topicEmbeddings",
//     "numDimensions": 1536,
//     "similarity": "cosine"
//   }]
// }