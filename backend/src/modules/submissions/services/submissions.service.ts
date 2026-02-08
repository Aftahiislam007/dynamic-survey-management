import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';
import { Response } from '../entities/response.entity';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { SurveysService } from '../../surveys/services/surveys.service';
import { FieldsService } from '../../fields/services/fields.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    private surveysService: SurveysService,
    private fieldsService: FieldsService,
  ) {}

  async create(
    surveyId: number,
    userId: number,
    createSubmissionDto: CreateSubmissionDto,
  ): Promise<Submission> {
    try {
      // Validate survey exists
      const survey = await this.surveysService.findOne(surveyId);
      if (!survey) {
        throw new NotFoundException('Survey not found');
      }

      // Get all fields for the survey
      const fields = await this.fieldsService.findAll(String(surveyId));
      
      // Create response map for easier lookup
      const responseMap = new Map(
        createSubmissionDto.responses.map((r) => [r.fieldId, r.value]),
      );

      // Validate each field
      for (const field of fields) {
        const value = responseMap.get(field.id);

        // Check required fields
        if (
          field.required &&
          (value == null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0))
        ) {
          throw new BadRequestException(`${field.label} is required`);
        }

        // Skip validation if field is not required and value is empty
        if (!value && !field.required) {
          continue;
        }

        const rules = field.validationRules || {};

        // Validate based on field type
        if (field.type === 'text' && typeof value === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            throw new BadRequestException(
              `${field.label} must be at least ${rules.minLength} characters`,
            );
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            throw new BadRequestException(
              `${field.label} must not exceed ${rules.maxLength} characters`,
            );
          }
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            throw new BadRequestException(`${field.label} format is invalid`);
          }
        } else if (field.type === 'checkbox' && Array.isArray(value)) {
          if (rules.minSelections && value.length < rules.minSelections) {
            throw new BadRequestException(
              `${field.label} requires at least ${rules.minSelections} selections`,
            );
          }
          if (rules.maxSelections && value.length > rules.maxSelections) {
            throw new BadRequestException(
              `${field.label} allows maximum ${rules.maxSelections} selections`,
            );
          }
          if (field.options && field.options.length > 0) {
            value.forEach((v) => {
              if (!field.options!.includes(v)) {
                throw new BadRequestException(
                  `Invalid option "${v}" for ${field.label}`,
                );
              }
            });
          }
        } else if (
          (field.type === 'radio' || field.type === 'select') &&
          typeof value === 'string'
        ) {
          if (field.options && !field.options.includes(value)) {
            throw new BadRequestException(
              `Invalid option "${value}" for ${field.label}`,
            );
          }
        } else if (value != null) {
          throw new BadRequestException(
            `Invalid value type for ${field.label}`,
          );
        }
      }

      // Create submission
      const submission = this.submissionRepository.create({
        surveyId,
        userId,
        createdBy: userId,
      });

      const savedSubmission = await this.submissionRepository.save(submission);

      // Create responses
      const responses = createSubmissionDto.responses.map((res) =>
        this.responseRepository.create({
          submissionId: savedSubmission.id,
          fieldId: res.fieldId,
          value: res.value,
          createdBy: userId,
        }),
      );

      await this.responseRepository.save(responses);

      return savedSubmission;
    } catch (error) {
      console.log(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create submission: ${error.message}`,
      );
    }
  }

  async findAll(
    surveyId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Submission[]; total: number; page: number; limit: number }> {
    try {
      const [data, total] = await this.submissionRepository.findAndCount({
        where: { 
          surveyId,
          isActive: true,
        },
        relations: ['responses', 'responses.field', 'user'],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          createdAt: 'DESC',
        },
      });

      return { 
        data, 
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch submissions: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id, isActive: true },
        relations: ['responses', 'responses.field', 'user', 'survey'],
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      return submission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch submission: ${error.message}`,
      );
    }
  }

  async deleteSubmission(deletedBy: number, id: number) {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id },
      });

      if (!submission) {
        return {
          Status: 404,
          message: 'Submission not found',
          error: 'Not Found',
        };
      }

      // Soft delete responses first
      await this.responseRepository.update(
        { submissionId: id },
        {
          isActive: false,
          deletedBy,
        },
      );

      await this.responseRepository.softDelete({ submissionId: id });

      // Soft delete submission
      await this.submissionRepository.update(id, {
        isActive: false,
        deletedBy,
      });

      const result = await this.submissionRepository.softDelete(id);

      return result;
    } catch (error) {
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }
}