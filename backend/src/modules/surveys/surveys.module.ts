import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyController } from './controllers/surveys.controller';
import { SurveysService } from './services/surveys.service';
import { Survey } from './entities/survey.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, User]),
  ],
  controllers: [SurveyController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}