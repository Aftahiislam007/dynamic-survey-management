import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Response } from './entities/response.entity';
import { SubmissionsService } from './services/submissions.service';
import { SubmissionsController } from './controllers/submissions.controller';
import { SurveysModule } from '../surveys/surveys.module';
import { FieldsModule } from '../fields/fields.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Response]),
    SurveysModule,
    FieldsModule,
    AuthModule,
  ],
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
})
export class SubmissionsModule {}