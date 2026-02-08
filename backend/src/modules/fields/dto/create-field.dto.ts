import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFieldDto {
  @ApiProperty({ description: 'Field label', example: 'Full Name' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({
    enum: ['text', 'checkbox', 'radio', 'select'],
    description: 'Field type',
    example: 'text',
  })
  @IsEnum(['text', 'checkbox', 'radio', 'select'])
  @IsNotEmpty()
  type!: 'text' | 'checkbox' | 'radio' | 'select';

  @ApiProperty({
    description: 'Is field required?',
    default: false,
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  required!: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Options for select, radio, or checkbox fields',
    example: ['Option 1', 'Option 2', 'Option 3'],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    description: 'Validation rules',
    example: { minLength: 3, maxLength: 100 },
  })
  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>;
}
