import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from 'src/modules/users/data/auth-provider.enum';

export class AuthDTO {
  readonly userId?: number;
  readonly email?: string;
  readonly enroll?: number;
  readonly password?: string;
  readonly otp?: number;
  readonly accessToken?: string;
  readonly refreshToken?: string;
}

export class LoginDTO {
  @ApiProperty({
    example: 'admin@neoscoder.com',
    description: 'Email address of the user',
  })
  email?: string;

  @ApiProperty({
    example: '123456',
    description: 'Password of the user',
  })
  password?: string;
}

export class RegisterDTO {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  lastName?: string;

  @ApiProperty({
    example: AuthProvider.EMAIL,
    description: 'Authentication provider of the user',
    enum: AuthProvider,
  })
  authProvider?: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the user',
  })
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the user',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '123456',
    description: 'Password of the user',
  })
  password?: string;

  @ApiProperty({
    example: '123456',
    description: "Confirmation of the user's password",
  })
  confirmPassword?: string;
}

export class UpdatePasswordDTO {
  @ApiProperty({
    example: '123456',
    description: 'Current password of the user',
  })
  currentPassword?: string;

  @ApiProperty({
    example: 'newpassword',
    description: 'New password of the user',
  })
  newPassword?: string;

  @ApiProperty({
    example: 'newpassword',
    description: 'Confirmation of the new password',
  })
  confirmNewPassword?: string;
}

export class RegOrgDTO {
  name?: string;
  orgCode?: string;
  numberOfEmployees?: number;
  description?: string;
  industryType?: string;
  website?: string;
  createdBy?: string;
  createdAt?: Date;
  isActive?: boolean;
  updatedAt?: Date;
  orgId?: number;
  roleId?: number;
}
