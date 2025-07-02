import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LecturesService } from '../lectures/lectures.service';
import { AuthContextType } from '@app/common/decorators/auth-context.decorator';

@Injectable()
export class LectureAgentConfigService {
  constructor(
    private lecturesService: LecturesService,
    private configService: ConfigService,
  ) { }

  async getConfig(authContext: AuthContextType, id: string) {
    return null;
  }
}
