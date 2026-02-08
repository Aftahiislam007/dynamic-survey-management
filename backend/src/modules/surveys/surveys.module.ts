import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';
import { User } from '../users/entities/user.entity';
import { Field } from '../fields/entities/field.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SurveysController } from './controllers/surveys.controller';
import { SurveysService } from './services/surveys.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, User, Field, Submission]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}