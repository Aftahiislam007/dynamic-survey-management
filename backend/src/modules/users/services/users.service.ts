import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserPasswordSecurityManager } from '../entities/user-password-security-manager.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserTypes } from '../data/user-type.enum';
import { Gender } from '../data/user-gender.enum';
import { hashPassword } from 'src/utils/bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPasswordSecurityManager)
    private userPasswordSecurityManagerRepository: Repository<UserPasswordSecurityManager>,

    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}
  async createUser(
    userId: number,
    userDto: CreateUserDto,
  ): Promise<User> {
    try {
      console.log(userDto);
     
      if (!userDto.email) throw new BadRequestException('Email is required');
      if (!userDto.userType)
        throw new BadRequestException('User Type is required');
      //   check if userType is not from UserTypes enum
      const userTypes = Object.values(UserTypes);
      if (!userTypes.includes(userDto.userType as UserTypes))
        throw new BadRequestException('Invalid user type');
      const gender = Object.values(Gender);
      if (!gender.includes(userDto.gender as Gender))
        throw new BadRequestException('Invalid gender type');

      if (userDto.password !== userDto.confirmPassword)
        throw new BadRequestException(
          'Password and Confirm Password do not match',
        );


      const isEmailExist = await this.userRepository.findOne({
        where: { email: userDto.email },
      });
      if (isEmailExist) throw new NotFoundException('Email already exists');

      const hashedPassword = await hashPassword(userDto.password!);

      const user = this.userRepository.create({
        ...userDto,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        isActive: true,
        authProvider: userDto.authProvider,
        password: hashedPassword,
        createdBy: userId,
      });

      const savedUser = await this.userRepository.save(user);

      const userPasswordSecurityManager =
        this.userPasswordSecurityManagerRepository.create({
          decryptedPassword: userDto.password,
          user: savedUser,
          userId: savedUser.id,
          createdBy: userId,
        });
      await this.userPasswordSecurityManagerRepository.save(
        userPasswordSecurityManager,
      );

      return savedUser;
      // console.log(user)
    } catch (error) {
      console.log(error);
      throw error ;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      // console.log("inside find all");
      const info = await this.userRepository.find({
        where: {
          isActive: true,
          isSuperAdmin: false,
          userType: Not(UserTypes.SUPER_ADMIN),
        },
      });
      return info;

    } catch (error) {
      throw error;
    }
  }

  async findOfficers() {
    try {
      const info = await this.userRepository.find({
        where: {
          isActive: true,
          userType: UserTypes.OFFICER,
        },
      });
      console.log(info);
      return info;
    } catch (error) {
      return error;
    }
  }

  async findById(intId: number) {
    try {
      const info = await this.userRepository.findOne({
        where: { id: intId, isActive: true },
      });
      return info;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    userId: number,
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      // Check existing user
      const existingUserInfo = await this.findOneUserByIdWithPassword(id);

      if (!existingUserInfo)
        throw new NotFoundException('Employee info not found');

      // Validate password if provided
      if (
        updateUserDto.password &&
        updateUserDto.password !== updateUserDto.confirmPassword
      ) {
        throw new BadRequestException(
          'Password and Confirm Password do not match',
        );
      }

      // Check email uniqueness if email is being updated
      if (updateUserDto.email) {
        const isEmailExist = await this.userRepository.findOne({
          where: {
            id: Not(existingUserInfo.id),
            email: updateUserDto.email,
          },
        });
        if (isEmailExist) throw new NotFoundException('Email already exists');
      }

      // Handle password - either remove it or hash it
      const cleanedUpdateDto: any = { ...updateUserDto };
      if (!updateUserDto.password || updateUserDto.password === '') {
        delete cleanedUpdateDto.password;
        delete cleanedUpdateDto.confirmPassword;
      } else {
        cleanedUpdateDto.password = await hashPassword(
          updateUserDto.password!,
        );
        delete cleanedUpdateDto.confirmPassword;
      }

      const updateData = {
        ...cleanedUpdateDto,
        fullName:
          cleanedUpdateDto.firstName + ' ' + cleanedUpdateDto.lastName,
        updatedBy: userId,
      };

      // Save the updated user
      let updatedUser = await this.userRepository.save(updateData);

      if (updateUserDto.password) {
        const getUserPasswordSecurityManager =
          await this.userPasswordSecurityManagerRepository.findOne({
            where: { userId: updatedUser.intId },
          });
        if (!getUserPasswordSecurityManager) {
          const userPasswordSecurityManager = new UserPasswordSecurityManager();
          userPasswordSecurityManager.userId = updatedUser.intId;
          userPasswordSecurityManager.user = updatedUser;
          userPasswordSecurityManager.decryptedPassword =
            updateUserDto.password;
          userPasswordSecurityManager.updatedBy = userId;
          await this.userPasswordSecurityManagerRepository.save(
            userPasswordSecurityManager,
          );
        } else {
          getUserPasswordSecurityManager.decryptedPassword =
            updateUserDto.password;
          getUserPasswordSecurityManager.updatedBy = userId;
          await this.userPasswordSecurityManagerRepository.save(
            getUserPasswordSecurityManager,
          );
        }
      }
      return updatedUser;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  private async findOneUserByIdWithPassword(intId: number) {
    try {
      const info = await this.userRepository.findOne({
        where: { id: intId, isActive: true },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phoneNumber',
          'password',
          'gender',
          'userType',
          'authProvider',
          'otp',
          'otpExpiredAt',
          'isSuperAdmin',
          'isEmailVerified',
          'createdAt',
          'updatedAt',
          'isActive',
          'createdBy',
          'updatedBy',
        ],
      });
      return info;
    } catch (error) {
      return error;
    }
  }

  async deleteUser(deletedBy: any, intId: number) {
    try {
      const userInfo = await this.userRepository.findOneBy({ id: intId });
      if (!userInfo) {
        return {
          Status: 404,
          message: 'User not found',
          error: 'Not Found',
        };
      }

      if (
        deletedBy.userType === UserTypes.OFFICER &&
        (userInfo.userType === UserTypes.ADMIN ||
          userInfo.userType === UserTypes.SUPER_ADMIN)
      ) {
        return {
          Status: 400,
          message: 'Regional Managers cannot delete Admins',
          error: 'Bad Request',
        };
      }

      const userPasswordSecurityManager =
        await this.userPasswordSecurityManagerRepository.findOne({
          where: { userId: intId },
        });

      if (userPasswordSecurityManager) {
        await this.userPasswordSecurityManagerRepository.update(intId, {
          isActive: false,
          deletedBy: deletedBy.id || deletedBy.intId,
        });
        await this.userPasswordSecurityManagerRepository.softDelete({
          userId: intId,
        });
      }
      await this.userRepository.update(intId, {
        isActive: false,
        deletedBy: deletedBy.id || deletedBy.intId,
      });
      const info = await this.userRepository.softDelete(intId);
      return info;
    } catch (error) {
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }

  async findOneUserByEmail(strEmail: string) {
    try {
      const info = await this.userRepository.findOne({
        where: { email: strEmail, isActive: true },
      });

      return info;
    } catch (error) {
      return error;
    }
  }
}