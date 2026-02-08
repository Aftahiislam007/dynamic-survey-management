import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsInt,
  IsDate,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyStatus } from '../data/survey-status.enum';
import { Type } from 'class-transformer';

export class CreateSurveyDto {
  @ApiProperty({
    description: 'Survey title',
    example: 'Customer Satisfaction Survey 2024',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Survey description',
    example: 'Annual customer satisfaction survey',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
    description: 'Survey status',
  })
  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @ApiPropertyOptional({
    description: 'Survey start date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Survey end date',
    example: '2024-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Is survey public?',
    default: true,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Target number of responses',
    example: 1000,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  targetResponses?: number;

  @ApiPropertyOptional({ description: 'Assigned officer ID', example: 1 })
  @IsInt()
  @IsOptional()
  assignedOfficerId?: number;
}
