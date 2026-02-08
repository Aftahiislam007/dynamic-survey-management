import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  Delete,
  Res,
} from '@nestjs/common';
import { SubmissionsService } from '../services/submissions.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AllowedUserTypes } from 'src/decorators/allowed-user-types.decorator';
import { UserTypes } from '../../users/data/user-type.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Submission } from '../entities/submission.entity';
import { ThrottlerGuard } from '@nestjs/throttler';
import { success, notFound, requestInvalid } from 'src/helpers/http';
import { SUCCESS, REQUEST_ERROR } from 'src/shared/constants/httpCodes';
import type { Response } from 'express';

@ApiTags('📝 Submissions API')
@UseGuards(ThrottlerGuard, JwtAuthGuard, AccessControlGuard)
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':surveyId')
  @AllowedUserTypes(UserTypes.OFFICER)
  @ApiOperation({ summary: 'Submit survey response' })
  @ApiParam({ name: 'surveyId', type: Number, description: 'Survey ID' })
  @ApiBody({ type: CreateSubmissionDto })
  @ApiResponse({
    status: 201,
    description: 'Submission created successfully',
    type: Submission,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async create(
    @Request() request: any,
    @Param('surveyId') surveyId: number,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    try {
      const data = await this.submissionsService.create(
        +surveyId,
        +request.user.id,
        createSubmissionDto,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Submission created successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':surveyId')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all submissions for a survey (paginated)' })
  @ApiParam({ name: 'surveyId', type: Number, description: 'Survey ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all submissions',
    type: [Submission],
  })
  async findAll(
    @Param('surveyId') surveyId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const result = await this.submissionsService.findAll(
        +surveyId,
        Number(page),
        Number(limit),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Submissions retrieved successfully',
        ...result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('detail/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Get submission by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission found', type: Submission })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findOne(@Param('id') id: number) {
    try {
      const data = await this.submissionsService.findOne(+id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Submission retrieved successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a submission' })
  @ApiParam({ name: 'id', type: Number, description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async deleteSubmission(
    @Request() request: any,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    try {
      const data: any = await this.submissionsService.deleteSubmission(
        request.user.id,
        +id,
      );

      if (data?.Status === 404) {
        return response.status(404).json(notFound('Submission not found'));
      }

      if (data?.Status === 500) {
        return response
          .status(REQUEST_ERROR)
          .json(requestInvalid(data.message));
      }

      return response
        .status(SUCCESS)
        .json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }
}