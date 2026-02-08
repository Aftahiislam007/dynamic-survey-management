import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  Req,
  Patch,
  NotFoundException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { SurveysService } from '../services/surveys.service';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AllowedUserTypes } from 'src/decorators/allowed-user-types.decorator';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Survey } from '../entities/survey.entity';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { notFound, requestInvalid, success } from 'src/helpers/http';
import { REQUEST_ERROR, SUCCESS } from 'src/shared/constants/httpCodes';
import { handleInternalError } from 'src/shared/error/handleInternalError';
import type { Response } from 'express';
import { SurveyStatus } from '../data/survey-status.enum';
import { UserTypes } from 'src/modules/users/data/user-type.enum';

@ApiTags('📊🔒Survey API')
@UseGuards(ThrottlerGuard, JwtAuthGuard, AccessControlGuard)
@ApiBearerAuth()
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiBody({ type: CreateSurveyDto })
  @ApiOperation({ summary: 'Create a new survey' })
  @ApiResponse({ status: 201, description: 'Survey created successfully', type: Survey })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Request() request: any, @Body() createSurveyDto: CreateSurveyDto) {
    try {
      const data = await this.surveysService.create(+request.user.id, createSurveyDto);

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
  @ApiOperation({ summary: 'Get all surveys (paginated)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Return all surveys', type: [Survey] })
  @ApiResponse({ status: 404, description: 'No surveys found' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    try {
      const result = await this.surveysService.findAll(page, limit);
      return {
        statusCode: HttpStatus.OK,
        message: 'All surveys',
        data: result.data,
        total: result.total,
        page: page,
        limit: limit,
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
      const data: any = await this.surveysService.findActiveSurveys();
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
  @ApiParam({ name: 'status', enum: SurveyStatus, description: 'Survey status' })
  @ApiResponse({ status: 200, description: 'Return surveys by status' })
  @ApiResponse({ status: 404, description: 'No surveys found' })
  async findByStatus(
    @Req() request: Request,
    @Res() response: Response,
    @Param('status') status: SurveyStatus,
  ) {
    try {
      const data = await this.surveysService.findSurveysByStatus(status);
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
  @ApiOperation({ summary: 'Get survey by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Survey found', type: Survey })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async findOne(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const data = await this.surveysService.findOne(id);
      if (data === null) {
        throw new NotFoundException('Survey not found');
      }
      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Put(':id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Update survey information' })
  @ApiParam({ name: 'id', description: 'Survey identifier', type: Number })
  @ApiResponse({ status: 200, description: 'Survey updated successfully', type: Survey })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async update(
    @Request() request: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSurveyDto: UpdateSurveyDto,
  ) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Survey updated successfully',
        data: await this.surveysService.update(
          +request.user.id,
          id,
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
  @ApiParam({ name: 'id', description: 'Survey identifier', type: Number })
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
  @ApiResponse({ status: 200, description: 'Survey status updated successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async updateStatus(
    @Request() request: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SurveyStatus,
  ) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'Survey status updated successfully',
        data: await this.surveysService.updateSurveyStatus(
          +request.user.id,
          id,
          status,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a survey' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async remove(
    @Request() request: any,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.surveysService.remove(request.user, id);
      return response.status(SUCCESS).json(success({ message: 'Survey deleted successfully' }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        return response.status(404).json(notFound('Survey not found'));
      }
      return response.status(REQUEST_ERROR).json(requestInvalid(error.message));
    }
  }
}