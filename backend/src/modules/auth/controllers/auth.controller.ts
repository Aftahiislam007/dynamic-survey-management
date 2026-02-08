import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { platform } from 'os';
import { LoginDTO, RegisterDTO, UpdatePasswordDTO } from '../dto/auth.dto';
import { REQUEST_ERROR, SUCCESS } from 'src/shared/constants/httpCodes';
import { notFound, requestInvalid, success } from 'src/helpers/http';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('🌏 🔒 Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user and returns tokens',
  })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Request() request: any,
    @Res() response: Response,
    @Body() loginDTO: LoginDTO,
  ) {
    try {
      const data: any = await this.authService.login(request, loginDTO, 'web');

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: data,
      });
    } catch (error) {
      //   return response.status(REQUEST_ERROR).json(requestInvalid(error));
      return response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        error: error.message || 'An error occurred during login.',
      });
    }
  }

  @Post('officer-login')
  @ApiOperation({
    summary: 'Officer login',
    description: 'Authenticates Officer user and returns tokens',
  })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async officerLogin(
    @Request() request: any,
    @Res() response: Response,
    @Body() loginDTO: LoginDTO,
  ) {
    try {
      const data: any = await this.authService.login(request, loginDTO, 'web');

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: data,
      });
    } catch (error) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Invalid email or password',
        error: error.message || 'An error occurred during login.',
      });
    }
  }

  @Post('admin-registration')
  @ApiOperation({
    summary: 'Admin registration',
    description: 'Registers a new admin user',
  })
  @ApiBody({ type: RegisterDTO })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(
    @Request() request: any,
    @Res() response: Response,
    @Body() registerDTO: RegisterDTO,
  ) {
    try {
      const data: any = await this.authService.registration(
        request,
        registerDTO,
      );

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out a user by invalidating their token',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async logout(@Request() request: any, @Res() response: Response) {
    try {
      const result = await this.authService.logout(request.user.strEmail);
      return response.status(result.statusCode).json(result);
    } catch (error) {
      if (error.message === 'Email not found') {
        return response
          .status(401)
          .json({ status: 401, message: 'Unauthorized' });
      } else {
        return response
          .status(500)
          .json({ status: 500, message: 'Internal Server Error' });
      }
    }
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: "Sends a password reset link to the user's email",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(
    @Req() request: Request,
    @Res() response: Response,
    @Body('email') email: string,
  ) {
    try {
      const data: any = await this.authService.forgotPassword(email);
      if (!data) {
        return response.status(404).json(notFound('error'));
      }
      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: "Resets the user's password",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        strEmail: { type: 'string', example: 'user@example.com' },
        newPassword: { type: 'string', example: 'newpassword123' },
        otpToVerify: { type: 'number', example: 123456 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resetPassword(
    @Req() request: Request,
    @Res() response: Response,
    @Body('strEmail') strEmail: string,
    @Body('newPassword') newPassword: string,
    @Body('otpToVerify') otpToVerify: number,
  ) {
    try {
      const data: any = await this.authService.resetPassword(
        strEmail,
        otpToVerify,
        newPassword,
      );
      if (!data) {
        return response.status(404).json(notFound('error'));
      }
      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }

  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Validates refresh token and issues new access token',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    try {
      const authHeader = request.headers['authorization'];
      console.log('Authorization header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Refresh token must be provided as a Bearer token in the Authorization header',
        });
      }

      const refreshToken = authHeader.split(' ')[1];
      console.log('Extracted token:', refreshToken ? 'Present' : 'Missing');

      if (!refreshToken) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Refresh token is required',
        });
      }

      const data = await this.authService.validateRefreshToken(refreshToken);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: data,
      });
    } catch (error) {
      console.error('Refresh token error details:', error);

      if (error instanceof UnauthorizedException) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: error.message || 'Invalid or expired refresh token',
        });
      }

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to refresh token',
        error: error.message,
      });
    }
  }

  /*
  @Post("verify-password")
  @ApiOperation({
    summary: "Verify user credentials",
    description: "Verifies if email and password are valid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        password: { type: "string", example: "password123" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Credentials verified" })
  @ApiResponse({
    status: 404,
    description: "User not found or invalid credentials",
  })
  async verifyUserAndPassword(
    @Req() request: Request,
    @Res() response: Response,
    @Body("email") email: string,
    @Body("password") password: string
  ) {
    try {
      const data = await this.authService.verifyUserAndPassword(
        email,
        password
      );
      if (!data) {
        return response.status(404).json(notFound("error"));
      }
      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }
*/

  @ApiBearerAuth()
  @Put('update-password')
  @ApiOperation({
    summary: 'Update password',
    description: 'Updates user password after OTP verification',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Request() req,
    @Res() response: Response,
    @Body() updatePasswordDto: UpdatePasswordDTO,
  ) {
    try {
      const loggedInUserId = +req.user.id;
      const data = await this.authService.updatePassword(
        loggedInUserId,
        updatePasswordDto,
      );
      if (!data) {
        return response.status(404).json(notFound('error'));
      }
      if (data.Status !== 200) {
        console.log('Error updating password:', data);
        return response.status(400).json({
          statusCode: data.Status,
          message: data.message || 'Error updating password',
        });
      }

      return response.status(SUCCESS).json({
        statusCode: SUCCESS,
        message: 'Password updated successfully',
      });
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }
  /*
  @Get("verify/:email")
  @ApiOperation({
    summary: "Verify email exists",
    description: "Checks if an email exists in the system",
  })
  @ApiParam({ name: "email", description: "User email address" })
  @ApiResponse({ status: 200, description: "Email verification result" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async getUserByEmail(
    @Req() request: Request,
    @Res() response: Response,
    @Param("email") email: string
  ) {
    try {
      const data: any = await this.authService.isEmailExist(email);

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }

  @Post("verify-email")
  @ApiOperation({
    summary: "Send OTP",
    description: "Sends a one-time password to user email",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async sendOtp(
    @Req() request: Request,
    @Res() response: Response,
    @Body("email") email: string
  ) {
    try {
      const data: any = await this.authService.sendOtp(email);

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }
  */

  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Regenerates and sends a new OTP to user email',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resendOtp(
    @Req() request: Request,
    @Res() response: Response,
    @Body('email') email: string,
  ) {
    try {
      const data: any = await this.authService.regenerateOtp(email);

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      return response.status(REQUEST_ERROR).json(requestInvalid(error));
    }
  }

  // @Post('verify-otp')
  // @ApiOperation({
  //   summary: 'Verify OTP',
  //   description: 'Verifies the OTP sent to user email',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       email: { type: 'string', example: 'user@example.com' },
  //       otp: { type: 'number', example: 123456 },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  // @ApiResponse({ status: 400, description: 'Invalid OTP or bad request' })
  // async verifyOtp(
  //   @Req() request: Request,
  //   @Res() response: Response,
  //   @Body('email') email: string,
  //   @Body('otp') otp: number,
  // ) {
  //   try {
  //     const data: any = await this.authService.verifyOtp(email, otp);

  //     return response.status(SUCCESS).json(success(data));
  //   } catch (error) {
  //     return response.status(REQUEST_ERROR).json(requestInvalid(error));
  //   }
  // }
}
