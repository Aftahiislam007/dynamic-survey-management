import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
  Request,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AllowedUserTypes } from 'src/decorators/allowed-user-types.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { notFound, requestInvalid, success } from 'src/helpers/http';
import { REQUEST_ERROR, SUCCESS } from 'src/shared/constants/httpCodes';
import { handleInternalError } from 'src/shared/error/handleInternalError';
import type { Response } from 'express';
import { FieldsService } from '../services/fields.service';
import { UserTypes } from 'src/modules/users/data/user-type.enum';
import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';

@ApiTags('📝 Fields API')
@UseGuards(ThrottlerGuard, JwtAuthGuard, AccessControlGuard)
@ApiBearerAuth()
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post(':surveyId')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiBody({ type: CreateFieldDto })
  @ApiParam({ name: 'surveyId', type: String, description: 'Survey ID' })
  @ApiOperation({ summary: 'Create a new field for a survey' })
  @ApiResponse({ status: 201, description: 'Field created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async create(
    @Request() request: any,
    @Param('surveyId') surveyId: string,
    @Body() createFieldDto: CreateFieldDto,
  ) {
    try {
      const data = await this.fieldsService.create(
        +request.user.id,
        surveyId,
        createFieldDto,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Field created successfully',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':surveyId')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiParam({ name: 'surveyId', type: String, description: 'Survey ID' })
  @ApiOperation({ summary: 'Get all fields for a survey' })
  @ApiResponse({ status: 200, description: 'Return all fields' })
  @ApiResponse({ status: 404, description: 'No fields found' })
  async findAll(@Param('surveyId') surveyId: string) {
    try {
      const data = await this.fieldsService.findAll(surveyId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Fields retrieved successfully',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('detail/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: Number, description: 'Field ID' })
  @ApiOperation({ summary: 'Find field by ID' })
  @ApiResponse({ status: 200, description: 'Field found' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async findOne(
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    try {
      const data = await this.fieldsService.findOne(id);
      
      if (!data) {
        throw new NotFoundException('Field not found');
      }

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Patch('update/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: Number, description: 'Field ID' })
  @ApiBody({ type: UpdateFieldDto })
  @ApiOperation({ summary: 'Update field information' })
  @ApiResponse({ status: 200, description: 'Field updated successfully' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async update(
    @Request() request: any,
    @Param('id') id: number,
    @Body() updateFieldDto: UpdateFieldDto,
  ) {
    try {
      const data = await this.fieldsService.update(
        +request.user.id,
        +id,
        updateFieldDto,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Field updated successfully',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiParam({ name: 'id', type: Number, description: 'Field ID' })
  @ApiOperation({ summary: 'Delete a field' })
  @ApiResponse({ status: 200, description: 'Field deleted successfully' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  async remove(
    @Request() request: any,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    try {
      const data: any = await this.fieldsService.remove(+request.user.id, +id);
      
      if (data?.Status === 404) {
        return response.status(404).json(notFound('No field found'));
      }

      if (data.Status === 400) {
        return response
          .status(REQUEST_ERROR)
          .json(requestInvalid(data.message));
      }

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }
}