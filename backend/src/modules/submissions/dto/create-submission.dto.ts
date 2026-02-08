import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseItemDto {
  @ApiProperty({
    description: 'Field ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  fieldId!: number;

  @ApiProperty({
    description: 'Response value (can be string, number, array, etc.)',
    example: 'Sample answer',
  })
  @IsNotEmpty()
  value!: any;
}

export class CreateSubmissionDto {
  @ApiProperty({
    type: [ResponseItemDto],
    description: 'Array of field responses',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseItemDto)
  @IsNotEmpty()
  responses!: ResponseItemDto[];
}