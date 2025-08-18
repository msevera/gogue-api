import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery, UpdateQuery } from 'mongoose';
import { Lecture } from './entities/lecture.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { FindLecturesInputDto } from './dto/find-lectures.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { ObjectId } from 'mongodb';
import { SearchLecturesInputDto } from './dto/search-lectures.dto';
import { SessionOptions } from '@app/common/database/options';
import slug from 'slug';

@Injectable()
export class LecturesRepository extends CurrentAuthRepository<Lecture> {
  constructor(
    @InjectModel(Lecture.name)
    lectureModel: Model<Lecture>
  ) {
    super(lectureModel, Lecture);
  }

  async findOnePending(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.findOne(authContext, {
      // @ts-ignore
      'creationEvent.name': {
        $ne: 'DONE'
      }
    });

    return resource;
  }

  async findOnePendingShowNotification(
    authContext: AuthContextType | false,
  ) {
    const resource = await this.findOne(authContext, {
      // @ts-ignore
      'creationEvent.showNotification': true
    });

    return resource;
  }

  async find(
    authContext: AuthContextType | false,
    input: FindLecturesInputDto,
    pagination?: PaginationDto<Lecture>
  ) {
    const query: any = {};

    if (input.creationEventName) {
      query['creationEvent.name'] = input.creationEventName;
    }

    if (input.skipUserId) {
      query['userId'] = { $ne: new ObjectId(input.skipUserId) };
    }

    return super.find(false, query, pagination);
  }

  async findRecommended(authContext: AuthContextType,
    pagination?: PaginationDto<Lecture>) {
    const result = authContext.user.topicsEmbeddings.length > 0 ? await this.model.aggregate(
      [
        {
          $vectorSearch: {
            index: 'topic_embeddings_cosine',
            path: 'topicEmbeddings',
            queryVector: authContext.user.topicsEmbeddings,
            numCandidates: 10 * 20,
            limit: 15,
          }
        },
        {
          $addFields: {
            id: '$_id',
            score: {
              $meta: 'vectorSearchScore'
            }
          }
        }
      ]
    ).exec() : [];

    // console.log('result', result.map(r => ({
    //   id: r._id,
    //   score: r.score,
    //   name: r.name,
    //   topic: r.topic
    // })));

    return super.wrapIntoCursor(result, {
      hasPrev: false,
      prev: null,
      hasNext: false,
      next: null,
    });
  }

  async findSearch(
    authContext: AuthContextType,
    input: SearchLecturesInputDto,
    pagination?: PaginationDto<Lecture>
  ) {
    const result = await this.model.aggregate(
      [
        {
          $vectorSearch: {
            index: 'topic_embeddings_cosine',
            path: 'topicEmbeddings',
            queryVector: input.queryVector,
            numCandidates: 10 * 20,
            limit: 10,
          }
        },
        {
          $addFields: {
            id: '$_id',
            score: {
              $meta: 'vectorSearchScore'
            }
          }
        },
        {
          $match: {
            score: { $gt: 0.58 }
          }
        },
      ]
    ).exec();

    // console.log('result', result.map(r => ({
    //   id: r._id,
    //   score: r.score,
    //   name: r.name,
    //   topic: r.topic
    // })));

    return super.wrapIntoCursor(result, {
      hasPrev: false,
      prev: null,
      hasNext: false,
      next: null,
    });
  }

  // async updateOne(
  //   authContext: AuthContextType | false,
  //   filter: RootFilterQuery<Lecture> & { id?: string },
  //   update: UpdateQuery<Lecture>,
  //   options: SessionOptions = {},
  // ): Promise<Lecture> {
  //   const baseSlug = slug(update.topic, { lower: true });
  //   let newSlug = baseSlug;
  //   let counter = 1;

  //   // Keep checking until we find a unique slug
  //   while (await this.postModel.exists({ slug })) {
  //     newSlug = `${baseSlug}-${counter++}`;
  //   }
  //   const resource = await super.updateOne(authContext, filter, update, options);

  //   return resource;
  // }
} 