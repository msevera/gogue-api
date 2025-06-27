import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lecture } from './entities/lecture.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { FindLecturesInputDto } from './dto/find-lectures.dto';
import { PaginationDto } from '@app/common/dtos/pagination.input.dto';
import { ObjectId } from 'mongodb';

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

  async find(
    authContext: AuthContextType,
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
} 