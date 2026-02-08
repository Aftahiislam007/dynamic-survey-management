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
import { UserTypes } from '../data/user-type.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { notFound, requestInvalid, success } from 'src/helpers/http';
import { REQUEST_ERROR, SUCCESS } from 'src/shared/constants/httpCodes';
import { handleInternalError } from 'src/shared/error/handleInternalError';
import type { Response } from 'express';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('👤🔒User API')
@UseGuards(ThrottlerGuard, JwtAuthGuard, AccessControlGuard)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Request() request: any, @Body() userDto: CreateUserDto) {
    try {
      const data = await this.userService.createUser(+request.user.id, userDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: data,
      };
    } catch (error) {
      // console.log(error);
      // handleInternalError(error, response);
      throw error;
    }
  }

  @Get()
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 404, description: 'No users found' })
  async findAll() {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'All users',
        data: await this.userService.findAll(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('get-officers')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN, UserTypes.OFFICER)
  @ApiOperation({ summary: 'Get all officers' })
  @ApiResponse({ status: 200, description: 'Return all officers' })
  @ApiResponse({ status: 404, description: 'No officers found' })
  async findOfficers(@Req() request: Request, @Res() response: Response) {
    try {
      const data: any = await this.userService.findOfficers();
      if (data.length === 0) {
        return response
          .status(404)
          .json(notFound(`Currently there is no ${UserTypes.OFFICER}`));
      }

      return response.status(SUCCESS).json(success(data));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Get(':id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') intId: number,
  ) {
    try {
      const data = await this.userService.findById(intId);
      // remove sensitive data like password
      if (data === null) {
        throw new NotFoundException('User not found');
      }
      const { password, ...rest } = data;
      return response.status(SUCCESS).json(success(rest));
    } catch (error) {
      console.log(error);
      handleInternalError(error, response);
    }
  }

  @Patch('update/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User identifier' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Request() request: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: await this.userService.updateUser(
          +request.user.id,
          +id,
          updateUserDto,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  @AllowedUserTypes(UserTypes.ADMIN, UserTypes.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Request() request: any,
    @Res() response: Response,
    @Param('id') id: number,
  ) {
    // User cannot delete themselves unless they are an admin or super admin
    if (request.user.id === id) {
      if (
        request.user.userType !== UserTypes.ADMIN &&
        request.user.userType !== UserTypes.SUPER_ADMIN
      ) {
        return response
          .status(REQUEST_ERROR)
          .json(requestInvalid('You cannot delete your own account'));
      }
    }

    try {
      const data: any = await this.userService.deleteUser(request.user, id);
      if (data?.Status === 404) {
        return response.status(404).json(notFound('No user info found'));
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
