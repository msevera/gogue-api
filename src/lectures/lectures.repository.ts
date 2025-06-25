import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lecture } from './entities/lecture.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';
import { findOneOptions } from '@app/common/services/abstract.service';

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
} 