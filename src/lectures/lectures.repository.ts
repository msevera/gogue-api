import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lecture } from './entities/lecture.entity';
import { CurrentAuthRepository } from '@app/common/database/current-auth.repository';

@Injectable()
export class LecturesRepository extends CurrentAuthRepository<Lecture> {
  constructor(
    @InjectModel(Lecture.name)
    lectureModel: Model<Lecture>
  ) {
    super(lectureModel, Lecture);
  }
} 