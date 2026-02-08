import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from '../entities/field.entity';
import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { SurveysService } from 'src/modules/surveys/services/surveys.service';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private fieldRepository: Repository<Field>,
    private surveysService: SurveysService,
  ) {}

  async create(
    userId: number,
    surveyId: string,
    createFieldDto: CreateFieldDto,
  ): Promise<Field> {
    try {
      // Validate input
      if (!createFieldDto.label) {
        throw new BadRequestException('Label is required');
      }
      if (!createFieldDto.type) {
        throw new BadRequestException('Field type is required');
      }

      // Validate field type
      const validTypes = ['text', 'checkbox', 'radio', 'select'];
      if (!validTypes.includes(createFieldDto.type)) {
        throw new BadRequestException('Invalid field type');
      }

      // Validate options for select/radio/checkbox
      if (['select', 'radio', 'checkbox'].includes(createFieldDto.type)) {
        if (!createFieldDto.options || createFieldDto.options.length === 0) {
          throw new BadRequestException(
            `Options are required for ${createFieldDto.type} field type`,
          );
        }
      }

      // Check if survey exists
      const survey = await this.surveysService.findOne(+surveyId);
      if (!survey) {
        throw new NotFoundException('Survey not found');
      }

      const field = this.fieldRepository.create({
        ...createFieldDto,
        survey,
        surveyId,
        createdBy: userId,
        isActive: true,
      });

      return await this.fieldRepository.save(field);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(surveyId: string): Promise<Field[]> {
    try {
      return await this.fieldRepository.find({
        where: { 
          surveyId,
          isActive: true 
        },
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Field> {
    try {
      const field = await this.fieldRepository.findOne({
        where: { id, isActive: true },
        relations: ['survey'],
      });
      
      if (!field) {
        throw new NotFoundException('Field not found');
      }

      return field;
    } catch (error) {
      throw error;
    }
  }

  async update(
    userId: number,
    id: number,
    updateFieldDto: UpdateFieldDto,
  ): Promise<Field> {
    try {
      // Check if field exists
      const existingField = await this.fieldRepository.findOne({
        where: { id, isActive: true },
      });

      if (!existingField) {
        throw new NotFoundException('Field not found');
      }

      // Validate field type if provided
      if (updateFieldDto.type) {
        const validTypes = ['text', 'checkbox', 'radio', 'select'];
        if (!validTypes.includes(updateFieldDto.type)) {
          throw new BadRequestException('Invalid field type');
        }
      }

      // Validate options for select/radio/checkbox
      const fieldType = updateFieldDto.type || existingField.type;
      if (['select', 'radio', 'checkbox'].includes(fieldType)) {
        const options = updateFieldDto.options || existingField.options;
        if (!options || options.length === 0) {
          throw new BadRequestException(
            `Options are required for ${fieldType} field type`,
          );
        }
      }

      const updateData = {
        ...existingField,
        ...updateFieldDto,
        updatedBy: userId,
      };

      const updatedField = await this.fieldRepository.save(updateData);
      return updatedField;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update field: ${error.message}`,
      );
    }
  }

  async remove(deletedBy: number, id: number): Promise<any> {
    try {
      const field = await this.fieldRepository.findOne({
        where: { id, isActive: true },
      });

      if (!field) {
        return {
          Status: 404,
          message: 'Field not found',
          error: 'Not Found',
        };
      }

      await this.fieldRepository.update(id, {
        isActive: false,
        deletedBy: deletedBy,
      });

      const result = await this.fieldRepository.softDelete(id);
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