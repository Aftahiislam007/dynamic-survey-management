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

  async create(userId: number, createSurveyDto: CreateSurveyDto): Promise<Survey> {
    try {
      console.log(createSurveyDto);

      if (!createSurveyDto.title) throw new BadRequestException('Title is required');

      // Validate status if provided
      if (createSurveyDto.status) {
        const statuses = Object.values(SurveyStatus);
        if (!statuses.includes(createSurveyDto.status as SurveyStatus))
          throw new BadRequestException('Invalid survey status');
      }

      // Validate dates
      if (createSurveyDto.startDate && createSurveyDto.endDate) {
        if (new Date(createSurveyDto.startDate) > new Date(createSurveyDto.endDate)) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      const survey = this.surveyRepository.create({
        ...createSurveyDto,
        status: createSurveyDto.status || SurveyStatus.DRAFT,
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

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Survey[]; total: number }> {
    try {
      const [data, total] = await this.surveyRepository.findAndCount({
        where: {
          isActive: true,
        },
        relations: ['fields', 'assignedOfficer'],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          createdAt: 'DESC',
        },
      });
      return { data, total };
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
        relations: ['fields', 'assignedOfficer'],
      });
      console.log(info);
      return info;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: number): Promise<Survey | null> {
    try {
      const info = await this.surveyRepository.findOne({
        where: { id: id, isActive: true },
        relations: ['fields', 'assignedOfficer'],
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async findById(intId: number): Promise<Survey | null> {
    try {
      const info = await this.surveyRepository.findOne({
        where: { id: intId, isActive: true },
        relations: ['fields', 'assignedOfficer'],
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async update(userId: number, id: number, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    try {
      // Check existing survey
      const existingSurvey = await this.findOne(id);

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

  async remove(deletedBy: any, id: number): Promise<void> {
    try {
      const surveyInfo = await this.surveyRepository.findOneBy({ id: id });
      if (!surveyInfo) {
        throw new NotFoundException('Survey not found');
      }

      await this.surveyRepository.update(id, {
        isActive: false,
        deletedBy: deletedBy.id || deletedBy.intId,
      });
      await this.surveyRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete survey: ${error.message}`,
      );
    }
  }

  async findSurveysByStatus(status: SurveyStatus): Promise<Survey[]> {
    try {
      const info = await this.surveyRepository.find({
        where: {
          isActive: true,
          status: status,
        },
        relations: ['fields', 'assignedOfficer'],
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
      const survey = await this.findOne(id);
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
      const survey = await this.findOne(id);
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