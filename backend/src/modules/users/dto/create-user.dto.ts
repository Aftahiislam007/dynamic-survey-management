import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserTypes } from '../data/user-type.enum';
import { Gender } from '../data/user-gender.enum';
import { AuthProvider } from '../data/auth-provider.enum';

export class CreateUserDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ description: 'User password', example: 'strongpassword123' })
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiProperty({ description: 'User Confirm password', example: 'strongpassword123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword?: string;

  @ApiProperty({ enum: Gender, default: Gender.MALE, description: 'Gender' })
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ enum: UserTypes, default: UserTypes.OFFICER, description: 'User type' })
  @IsEnum(UserTypes)
  userType?: UserTypes;

  @ApiProperty({ enum: AuthProvider, default: AuthProvider.EMAIL, description: 'Authentication provider' })
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiPropertyOptional({ description: 'OTP for verification', example: 123456 })
  @IsOptional()
  otp?: number;

  @ApiPropertyOptional({ description: 'OTP expiration timestamp', example: 1700000000000 })
  @IsOptional()
  otpExpiredAt?: number;

  @ApiPropertyOptional({ description: 'Is super admin?', default: false, example: false })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @ApiPropertyOptional({ description: 'Is email verified?', default: false, example: false })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}