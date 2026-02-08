// backend/src/fields/fields.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './entities/field.entity';
import { FieldsService } from './services/fields.service';
import { SurveysModule } from '../surveys/surveys.module';
import { FieldsController } from './controllers/fields.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Field]),
    SurveysModule,
  ],
  providers: [FieldsService],
  controllers: [FieldsController],
  exports: [FieldsService],
})
export class FieldsModule {}