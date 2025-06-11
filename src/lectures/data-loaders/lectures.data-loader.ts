import { LecturesRepository } from '../lectures.repository';
import { Lecture } from '../entities/lecture.entity';
import { AbstractDataLoader } from '@app/common/data-loader/abstract.data-loader';

export class LectureDataLoader extends AbstractDataLoader<Lecture> {
  constructor(private readonly lecturesRepository: LecturesRepository) {
    super(lecturesRepository);
  }
}
