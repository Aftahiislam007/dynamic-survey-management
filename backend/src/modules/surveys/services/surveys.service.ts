import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { Survey } from '../entities/survey.entity';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { SurveyStatus } from '../data/survey-status.enum';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async createSurvey(
    userId: number,
    surveyDto: CreateSurveyDto,
  ): Promise<Survey> {
    try {
      console.log(surveyDto);

      if (!surveyDto.title) throw new BadRequestException('Title is required');

      // Validate status if provided
      if (surveyDto.status) {
        const statuses = Object.values(SurveyStatus);
        if (!statuses.includes(surveyDto.status as SurveyStatus))
          throw new BadRequestException('Invalid survey status');
      }

      // Validate dates
      if (surveyDto.startDate && surveyDto.endDate) {
        if (new Date(surveyDto.startDate) > new Date(surveyDto.endDate)) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      const survey = this.surveyRepository.create({
        ...surveyDto,
        status: surveyDto.status || SurveyStatus.DRAFT,
        totalResponses: 0,
        isActive: true,
        createdBy: userId,
      });

      const savedSurvey = await this.surveyRepository.save(survey);

      return savedSurvey;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(): Promise<Survey[]> {
    try {
      const info = await this.surveyRepository.find({
        where: {
          isActive: true,
        },
        relations: ['assignedOfficer'],
        order: {
          createdAt: 'DESC',
        },
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async findActiveSurveys() {
    try {
      const info = await this.surveyRepository.find({
        where: {
          isActive: true,
          status: SurveyStatus.ACTIVE,
        },
        relations: ['assignedOfficer'],
      });
      console.log(info);
      return info;
    } catch (error) {
      return error;
    }
  }

  async findById(id: number) {
    try {
      const info = await this.surveyRepository.findOne({
        where: { id: id, isActive: true },
        relations: ['assignedOfficer'],
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async updateSurvey(
    userId: number,
    id: number,
    updateSurveyDto: UpdateSurveyDto,
  ): Promise<Survey> {
    try {
      // Check existing survey
      const existingSurvey = await this.findById(id);

      if (!existingSurvey)
        throw new NotFoundException('Survey not found');

      // Validate status if provided
      if (updateSurveyDto.status) {
        const statuses = Object.values(SurveyStatus);
        if (!statuses.includes(updateSurveyDto.status as SurveyStatus))
          throw new BadRequestException('Invalid survey status');
      }

      // Validate dates
      if (updateSurveyDto.startDate && updateSurveyDto.endDate) {
        if (new Date(updateSurveyDto.startDate) > new Date(updateSurveyDto.endDate)) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      const updateData = {
        ...existingSurvey,
        ...updateSurveyDto,
        updatedBy: userId,
      };

      // Save the updated survey
      const updatedSurvey = await this.surveyRepository.save(updateData);

      return updatedSurvey;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update survey: ${error.message}`,
      );
    }
  }

  async deleteSurvey(deletedBy: any, id: number) {
    try {
      const surveyInfo = await this.surveyRepository.findOneBy({ id: id });
      if (!surveyInfo) {
        return {
          Status: 404,
          message: 'Survey not found',
          error: 'Not Found',
        };
      }

      await this.surveyRepository.update(id, {
        isActive: false,
        deletedBy: deletedBy.id || deletedBy.intId,
      });
      const info = await this.surveyRepository.softDelete(id);
      return info;
    } catch (error) {
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }

  async findSurveysByStatus(status: SurveyStatus): Promise<Survey[]> {
    try {
      const info = await this.surveyRepository.find({
        where: {
          isActive: true,
          status: status,
        },
        relations: ['assignedOfficer'],
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async updateSurveyStatus(
    userId: number,
    id: number,
    status: SurveyStatus,
  ): Promise<Survey> {
    try {
      const survey = await this.findById(id);
      if (!survey) throw new NotFoundException('Survey not found');

      survey.status = status;
      survey.updatedBy = userId;

      return await this.surveyRepository.save(survey);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update survey status: ${error.message}`,
      );
    }
  }

  async incrementResponseCount(id: number): Promise<Survey> {
    try {
      const survey = await this.findById(id);
      if (!survey) throw new NotFoundException('Survey not found');

      survey.totalResponses = (survey.totalResponses || 0) + 1;

      // Auto-complete if target reached
      if (survey.targetResponses && survey.totalResponses >= survey.targetResponses) {
        survey.status = SurveyStatus.COMPLETED;
      }

      return await this.surveyRepository.save(survey);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to increment response count: ${error.message}`,
      );
    }
  }
}