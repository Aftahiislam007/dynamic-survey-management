import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpStatus,
  Request,
  Res,
  Req,
  Patch,
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
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { SurveysService } from '../services/surveys.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { notFound, requestInvalid, success } from 'src/helpers/http';
import { REQUEST_ERROR, SUCCESS } from 'src/shared/constants/httpCodes';
import { handleInternalError } from 'src/shared/error/handleInternalError';
import type { Response } from 'express';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { SurveyStatus } from '../data/survey-status.enum';
import { UserTypes } from 'src/modules/users/data/user-type.enum';

@ApiTags('📊🔒Survey API')
@UseGuards(ThrottlerGuard, JwtAuthGuard, AccessControlGuard)
@ApiBearerAuth()
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveysService) {}

  @Post('create')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiBody({ type: CreateSurveyDto })
  @ApiOperation({ summary: 'Create a new survey' })
  @ApiResponse({ status: 201, description: 'Survey created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSurvey(
    @Request() request: any,
    @Body() surveyDto: CreateSurveyDto,
  ) {
    try {
      const data = await this.surveyService.createSurvey(
        +request.user.id,
        surveyDto,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Survey created successfully',
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Get all surveys' })
  @ApiResponse({ status: 200, description: 'Return all surveys' })
  @ApiResponse({ status: 404, description: 'No surveys found' })
  async findAll() {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'All surveys',
        data: await this.surveyService.findAll(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('get-active')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Get all active surveys' })
  @ApiResponse({ status: 200, description: 'Return all active surveys' })
  @ApiResponse({ status: 404, description: 'No active surveys found' })
  async findActiveSurveys(@Req() request: Request, @Res() response: Response) {
    try {
      const data: any = await this.surveyService.findActiveSurveys();
      if (data.length === 0) {
        return response
          .status(404)
          .json(notFound('Currently there are no active surveys'));
      }

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Get('status/:status')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Get surveys by status' })
  @ApiParam({
    name: 'status',
    enum: SurveyStatus,
    description: 'Survey status',
  })
  @ApiResponse({ status: 200, description: 'Return surveys by status' })
  @ApiResponse({ status: 404, description: 'No surveys found' })
  async findByStatus(
    @Req() request: Request,
    @Res() response: Response,
    @Param('status') status: SurveyStatus,
  ) {
    try {
      const data = await this.surveyService.findSurveysByStatus(status);
      if (data.length === 0) {
        return response
          .status(404)
          .json(notFound(`No surveys found with status: ${status}`));
      }

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Get(':id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Find survey by ID' })
  @ApiResponse({ status: 200, description: 'Survey found' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async findById(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    try {
      const data = await this.surveyService.findById(id);
      if (data === null) {
        throw new NotFoundException('Survey not found');
      }
      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Patch('update/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Update survey information' })
  @ApiParam({ name: 'id', description: 'Survey identifier' })
  @ApiResponse({ status: 200, description: 'Survey updated successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async updateSurvey(
    @Request() request: any,
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
  ) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Survey updated successfully',
        data: await this.surveyService.updateSurvey(
          +request.user.id,
          +id,
          updateSurveyDto,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('update-status/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update survey status' })
  @ApiParam({ name: 'id', description: 'Survey identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(SurveyStatus),
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Survey status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async updateStatus(
    @Request() request: any,
    @Param('id') id: string,
    @Body('status') status: SurveyStatus,
  ) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Survey status updated successfully',
        data: await this.surveyService.updateSurveyStatus(
          +request.user.id,
          +id,
          status,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a survey' })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async deleteSurvey(
    @Request() request: any,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    try {
      const data: any = await this.surveyService.deleteSurvey(request.user, id);
      if (data?.Status === 404) {
        return response.status(404).json(notFound('No survey found'));
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
