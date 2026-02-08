import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInfo } from '../entities/login-info.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { EntityManager, Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { hashPassword } from 'src/utils/bcrypt';
import { randomNumGenerate } from 'src/utils/randomOtpGenerator';
import { otpEmailBody } from 'src/utils/emailBody/otpEmailBody';
// import { sendMail } from "src/utils/sendEmail";
import { isEmail } from 'class-validator';
import { sendMail } from 'src/utils/sendEmail';
import { User } from 'src/modules/users/entities/user.entity';
import { UserPasswordSecurityManager } from 'src/modules/users/entities/user-password-security-manager.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { LoginDTO, RegisterDTO, UpdatePasswordDTO } from '../dto/auth.dto';
import { UserTypes } from 'src/modules/users/data/user-type.enum';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LoginInfo)
    private loginInfoRepository: Repository<LoginInfo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPasswordSecurityManager)
    private userPasswordSecurityManagerRepository: Repository<UserPasswordSecurityManager>,
    private userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  // generates refresh tokens only
  private async generateRefreshToken(existingUser: any) {
    try {
      const payload = {
        id: existingUser.id,
        email: existingUser.email,
        userType: existingUser.userType,
        tokenType: 'refresh',
      };

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION as StringValue || '30d' as StringValue,
      });

      // Modified: update login info using userId instead of intId directly
      await this.loginInfoRepository.update(
        { user_Id: existingUser.id },
        { refresh_token: refreshToken },
      );

      const decodedToken = this.jwtService.decode(refreshToken) as {
        exp: number;
      };
      const expiresIn = new Date(decodedToken.exp * 1000);

      return { refreshToken, expiresIn };
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new InternalServerErrorException(
        'Failed to generate refresh token.',
      );
    }
  }

  // generates access token only
  private async generateAccessToken(existingUser: any) {
    try {
      const payload = {
        id: existingUser.id,
        email: existingUser.email,
        userType: existingUser.userType,
        tokenType: 'access',
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION as StringValue || '1d' as StringValue,
      });

      const decodedToken = this.jwtService.decode(accessToken) as {
        exp: number;
      };
      const expiresIn = new Date(decodedToken.exp * 1000);

      // Update access token in login info
      //   await this.loginInfoRepository.update(
      //     { userId: existingUser.intId },
      //     {
      //       access_token: accessToken,
      //       access_token_expires: expiresIn,
      //     }
      //   );

      return { accessToken, expiresIn };
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new InternalServerErrorException(
        'Failed to generate access token.',
      );
    }
  }

  async login(req: any, loginDto: LoginDTO, platform: string) {
    if (!isEmail(loginDto.email)) {
      throw new BadRequestException('Invalid email format');
    }
    if (!loginDto.password) {
      throw new BadRequestException('Password is required');
    }
    try {
      const user = await this.userRepository.findOne({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true,
          userType: true,
          isSuperAdmin: true,
          isActive: true,
        },
        where: {
          email: loginDto.email,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found!');
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'Access denied: Your account is currently inactive.',
        );
      }

      if (user.userType === UserTypes.OFFICER && platform === 'web') {
        throw new UnauthorizedException(
          'Access denied: Officer is not allowed to access Admin Panel.',
        );
      }

      const passwordMatched = await compare(
        loginDto.password,
        user.password!,
      );
      if (!passwordMatched) {
        throw new NotFoundException('Invalid email or password!');
      }

      const refreshToken = await this.generateRefreshToken(user);
      const accessToken = await this.generateAccessToken(user);

      await this.logging(
        user,
        req,
        accessToken.accessToken,
        accessToken.expiresIn,
        refreshToken.refreshToken,
        refreshToken.expiresIn,
      );
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        isSuperAdmin: user.isSuperAdmin,
        access_token: accessToken.accessToken,
        access_token_expiresIn: accessToken.expiresIn,
        refresh_token: refreshToken.refreshToken,
        refresh_token_expiresIn: refreshToken.expiresIn,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (!(error instanceof UnauthorizedException)) {
        throw new UnauthorizedException('Invalid email or password.');
      }
      throw error;
    }
  }

  async registration(req: any, registerDTO: RegisterDTO) {
    try {
      let socialMediaLogin: boolean = false;
      if (
        registerDTO.authProvider === 'google' ||
        registerDTO.authProvider === 'facebook' ||
        registerDTO.authProvider === 'apple'
      ) {
        socialMediaLogin = true;
      }

      if (
        !socialMediaLogin &&
        registerDTO.password !== registerDTO.confirmPassword
      ) {
        throw new UnauthorizedException('Password does not match!');
      }

      const isUserExist = await this.userService.findOneUserByEmail(
        registerDTO.email!,
      );

      if (!socialMediaLogin && isUserExist) {
        throw new UnauthorizedException('User already exist!');
      } else if (socialMediaLogin && isUserExist) {
        return await this.socialLogin(req, registerDTO);
      }

      const userDto = new CreateUserDto();
      userDto.email = registerDTO.email;
      userDto.password = registerDTO.password;
      userDto.firstName = registerDTO.firstName;
      userDto.lastName = registerDTO.lastName;
      userDto.phoneNumber = registerDTO.phoneNumber;
      userDto.authProvider = registerDTO.authProvider as any; // Cast to any if AuthProvider is an enum; adjust based on actual type

      const user = await this.userService.createAdminUser(
        userDto,
        socialMediaLogin,
      );
      if (!user) {
        throw new InternalServerErrorException('Failed to create admin user');
      }
      console.log({ user });
      return user;
    } catch (error) {
      console.log(error);
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }

  async socialLogin(req: any, registerDTO: RegisterDTO) {
    try {
      const existingUser = await this.userService.findOneUserByEmail(registerDTO.email!);
      if (!existingUser) {
        throw new NotFoundException('User not found for social login');
      }

      if (!existingUser.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      const refreshToken = await this.generateRefreshToken(existingUser);
      const accessToken = await this.generateAccessToken(existingUser);

      await this.logging(
        existingUser,
        req,
        accessToken.accessToken,
        accessToken.expiresIn,
        refreshToken.refreshToken,
        refreshToken.expiresIn,
      );

      return {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        userType: existingUser.userType,
        isSuperAdmin: existingUser.isSuperAdmin,
        access_token: accessToken.accessToken,
        access_token_expiresIn: accessToken.expiresIn,
        refresh_token: refreshToken.refreshToken,
        refresh_token_expiresIn: refreshToken.expiresIn,
      };
    } catch (error) {
      console.error('Social login error:', error);
      throw new UnauthorizedException('Social login failed');
    }
  }

  async logout(strEmail: string) {
    try {
      const result = await this.loginInfoRepository.findOneBy({ email: strEmail });
      if (!result) {
        return { statusCode: 404, message: 'User not found' };
      }
      const userId = result.id;
      const logoutInfo = await this.loginInfoRepository.update(userId, {
        refresh_token: null,
        access_token: null, // Also invalidate the access token
      });

      if (logoutInfo.affected === 0)
        throw new InternalServerErrorException('Failed to logout');
      return { statusCode: 200, message: 'Logged out successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * LOGGING AUTHENTICATED USER
   */
  async logging(
    user: User,
    requestObject: any,
    accessToken: string,
    access_token_expire: Date,
    refreshToken: string,
    refresh_token_expire: Date,
  ) {
    try {
      // Try to find existing login info for this user
      let loginLog = await this.loginInfoRepository.findOne({
        where: { user_Id: user.id },
      });

      const ip =
        requestObject.headers['x-forwarded-for'] ||
        requestObject.connection.remoteAddress;
      const ipValue = ip ? ip.split(':').pop() : null;

      if (loginLog) {
        // Update existing login info
        loginLog.email = user.email;
        loginLog.dte_Last_Login = new Date();
        loginLog.ip = ipValue;
        loginLog.refresh_token = refreshToken;
        loginLog.refresh_token_expires = refresh_token_expire;
        // Optionally update access token fields if needed
        // loginLog.access_token = accessToken;
        // loginLog.access_token_expires = access_token_expire;
        return await this.loginInfoRepository.save(loginLog);
      } else {
        // Create new login info
        loginLog = new LoginInfo();
        loginLog.user_Id = user.id;
        loginLog.email = user.email;
        loginLog.dte_Last_Login = new Date();
        loginLog.ip = ipValue;
        loginLog.refresh_token = refreshToken;
        loginLog.refresh_token_expires = refresh_token_expire;
        // loginLog.access_token = accessToken;
        // loginLog.access_token_expires = access_token_expire;
        return await this.loginInfoRepository.save(loginLog);
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Some error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private convertExpToDate(decodedToken) {
    const expirationTimestamp = decodedToken.exp;
    const expirationDate = new Date(expirationTimestamp * 1000); // Convert seconds to milliseconds
    const refresh_token_expiresIn = expirationDate.toISOString();
    return refresh_token_expiresIn;
  }

  async validateRefreshToken(refreshToken: string) {
    console.log('Starting refresh token validation');
    try {
      let decodedToken;
      console.log('Verifying refresh token');

      try {
        decodedToken = await this.jwtService.verifyAsync(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
      } catch (error) {
        console.error('JWT verification error:', error.name, error.message);
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Refresh token has expired');
        } else if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException(
            `Invalid refresh token: ${error.message}`,
          );
        }
        throw new UnauthorizedException('Could not verify refresh token');
      }

      if (!decodedToken || decodedToken.tokenType !== 'refresh') {
        console.log('Token type issue:', decodedToken?.tokenType);
        throw new UnauthorizedException(
          "Invalid token type: expected 'refresh'",
        );
      }

      console.log('Looking for user with email:', decodedToken.email);
      const existingUser = await this.userService.findOneUserByEmail(
        decodedToken.email,
      );

      if (!existingUser) {
        console.log('User not found with email:', decodedToken.email);
        throw new UnauthorizedException('User not found');
      }
      // console.log('User found:', existingUser.id);

      // if (!existingUser.isActive) {
      //   throw new UnauthorizedException(
      //     'Access denied: Your account is currently inactive.',
      //   );
      // }

      console.log('Generating new access tokens');
      //   const newRefreshToken = await this.generateRefreshToken(existingUser);
      const newAccessToken = await this.generateAccessToken(existingUser);

      return {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        enroll: existingUser.enroll,
        userType: existingUser.userType,
        avatarUrl: existingUser.avatarUrl,
        isSuperAdmin: existingUser.isSuperAdmin,
        access_token: newAccessToken.accessToken,
        access_token_expiresIn: newAccessToken.expiresIn,
        refresh_token: refreshToken,
        refresh_token_expiresIn: this.convertExpToDate(decodedToken),
      };
    } catch (error) {
      console.error('Refresh token validation error:', error);
      throw error;
    }
  }

  async verifyUserAndPassword(email: string, password: string) {
    try {
      const user = await this.userService.findOneUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const passwordMatched = await compare(password, user.password);
      if (!passwordMatched) {
        throw new UnauthorizedException('Wrong password');
      }
      return { status: 200, message: 'Password matched' };
    } catch (error) {
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }

  async updatePassword(
    loggedInUserId: number,
    updatePasswordDTO: UpdatePasswordDTO,
  ) {
    try {
      const user = await this.userRepository.findOne({
        select: {
          id: true,
          email: true,
          password: true,
        },
        where: { id: loggedInUserId },
      });
      if (!user) {
        return {
          Status: HttpStatus.NOT_FOUND,
          message: 'User not found!',
        };
      }

      const passwordMatched = await compare(
        updatePasswordDTO.currentPassword!,
        user.password!,
      );
      if (!passwordMatched) {
        return {
          Status: HttpStatus.BAD_REQUEST,
          message: 'Wrong password!',
        };
      }
      if (
        updatePasswordDTO.newPassword !==
        updatePasswordDTO.confirmNewPassword
      ) {
        return {
          Status: HttpStatus.BAD_REQUEST,
          message: 'New password does not match with Confirm password!',
        };
      }

      if (
        updatePasswordDTO.currentPassword ===
        updatePasswordDTO.newPassword
      ) {
        return {
          Status: HttpStatus.BAD_REQUEST,
          message: 'New password cannot be same as current password!',
        };
      }

      const hashedPassword = await hashPassword(
        updatePasswordDTO.newPassword!,
      );

      await this.userService.updatePassword(
        loggedInUserId,
        user.email,
        hashedPassword,
        updatePasswordDTO.newPassword!,
      );
      return { Status: 200, message: 'Password updated' };
    } catch (error) {
      return {
        Status: 500,
        message: error.message,
        error: 'Internal Server Error',
      };
    }
  }

  async forgotPassword(email: string) {
    try {
      // Validate email format
      if (!isEmail(email)) {
        return {
          status: 400,
          message: 'Invalid email format',
        };
      }

      const user = await this.userService.findOneUserByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists or not
        return {
          status: 200,
          message:
            'If the email exists in our system, you will receive an OTP shortly',
        };
      }

      if (!user.isActive) {
        return {
          status: 400,
          message: 'Account is inactive. Please contact support.',
        };
      }

      // Generate OTP
      const otp = randomNumGenerate.generateOTP();

      // Set OTP expiration time (5 minutes from now)
      const currentTime = new Date().getTime();
      const expirationTime = currentTime + 5 * 60 * 1000; // 5 minutes in milliseconds

      // Update user with OTP and expiration
      user.otp = otp;
      user.otpExpiredAt = expirationTime;
      await this.userRepository.save(user);

      // Send email
      const mailBody = otpEmailBody(otp);
      const emailResult = await sendMail(
        email,
        'MABI Password Reset OTP',
        mailBody,
      );

      if (!emailResult.success) {
        console.error('Failed to send OTP email:', emailResult.message);
        // Clear the OTP since email failed
        // user.intOtp = null;
        // user.otpExpiredAt = null;
        // await this.userRepository.save(user);

        return {
          status: 500,
          message: 'Failed to send email. Please try again later.',
        };
      }

      console.log(`OTP sent successfully to ${email}`);
      return {
        status: 200,
        message: 'OTP sent successfully to your email',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        status: 500,
        message: 'Internal server error. Please try again later.',
        error: error.message,
      };
    }
  }
  async resetPassword(email: string, otpToVerify: number, newPassword: string) {
    try {
      // Validate inputs
      if (!isEmail(email)) {
        return { status: 400, message: 'Invalid email format' };
      }

      if (!otpToVerify || !newPassword) {
        return { status: 400, message: 'OTP and new password are required' };
      }

      if (newPassword.length < 6) {
        return {
          status: 400,
          message: 'Password must be at least 6 characters long',
        };
      }

      const user = await this.userService.findOneUserByEmail(email);
      if (!user) {
        return { status: 400, message: 'Invalid request' };
      }

      if (!user.isActive) {
        return { status: 400, message: 'Account is inactive' };
      }

      // Check if OTP exists
      if (!user.otp) {
        return {
          status: 400,
          message: 'No OTP found. Please request a new one.',
        };
      }

      // Check if OTP matches
      if (user.intOtp !== otpToVerify) {
        return { status: 400, message: 'Invalid OTP' };
      }

      // Check if OTP has expired
      const currentTimestamp = new Date().getTime();
      if (!user.otpExpiredAt || currentTimestamp > user.otpExpiredAt) {
        // Clear expired OTP
        user.intOtp = null;
        user.otpExpiredAt = null;
        await this.userRepository.save(user);
        return {
          status: 400,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear OTP
      await this.userService.updatePassword(
        user.intId,
        user.strEmail,
        hashedPassword,
        newPassword,
      );

      //   // Clear OTP after successful password reset
      //   user.intOtp = null;
      //   user.otpExpiredAt = null;
      //   await this.userRepository.save(user);

      console.log(`Password reset successfully for user: ${email}`);
      return { status: 200, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        status: 500,
        message: 'Internal server error. Please try again later.',
        error: error.message,
      };
    }
  }

  async isEmailExist(email: string) {
    try {
      const userInfo = await this.loginInfoRepository.findOne({
        where: { email: email },
      });
      if (userInfo) {
        return {
          status: 409,
          message: 'Email already exist! Please try with another email.',
        };
      }
      return { status: 200, message: 'Email is available' };
    } catch (error) {}
  }

  // async sendOtp(email: string) {
  //   try {
  //     // Validate email format
  //     if (!isEmail(email)) {
  //       return { status: 400, message: 'Invalid email format' };
  //     }

  //     const existingUser: User =
  //       await this.userService.findOneUserByEmail(email);
  //     if (!existingUser) {
  //       return { status: 404, message: 'User not found' };
  //     }

  //     if (!existingUser.isActive) {
  //       return { status: 400, message: 'Account is inactive' };
  //     }

  //     if (existingUser.isEmailVerified) {
  //       return { status: 400, message: 'Email is already verified' };
  //     }

  //     // Generate OTP
  //     const otp = randomNumGenerate.generateOTP();

  //     // Set OTP expiration time (5 minutes from now)
  //     const currentTime = new Date().getTime();
  //     const expirationTime = currentTime + 5 * 60 * 1000; // 5 minutes in milliseconds

  //     // Update user with OTP and expiration
  //     existingUser.intOtp = otp;
  //     existingUser.otpExpiredAt = expirationTime;
  //     await this.userRepository.save(existingUser);

  //     // Send email
  //     const mailBody = otpEmailBody(otp);
  //     const emailResult = await sendMail(
  //       email,
  //       'MABI Email Verification OTP',
  //       mailBody,
  //     );

  //     if (!emailResult.success) {
  //       console.error('Failed to send OTP email:', emailResult.message);
  //       // Clear the OTP since email failed
  //       existingUser.intOtp = 0;
  //       existingUser.otpExpiredAt = 0;
  //       await this.userRepository.save(existingUser);

  //       return {
  //         status: 500,
  //         message: 'Failed to send email. Please try again later.',
  //       };
  //     }

  //     console.log(`OTP sent successfully to ${email}`);
  //     return {
  //       status: 200,
  //       message: 'OTP sent successfully to your email',
  //     };
  //   } catch (error) {
  //     console.error('Send OTP error:', error);
  //     return {
  //       status: 500,
  //       message: 'Internal server error. Please try again later.',
  //       error: error.message,
  //     };
  //   }
  // }

  // async verifyOtp(email: string, otpToVerify: number) {
  //   try {
  //     const user = await this.userService.findOneUserByEmail(email);
  //     const currentTimestamp = new Date().getTime();
  //     if (user && user.intOtp === otpToVerify) {
  //       if (currentTimestamp > user.codeExpiredAt) {
  //         return { status: 400, message: 'OTP expired' };
  //       }
  //       // user.isEmailVerified = true;
  //       return { status: 200, message: 'OTP verified successfully' };
  //     } else {
  //       return { status: 400, message: 'Invalid OTP' };
  //     }
  //   } catch (error) {
  //     console.error('Verification error:', error);
  //     return {
  //       status: 500,
  //       message: 'Internal Server Error',
  //       error: error.message,
  //     };
  //   }
  // }

  async regenerateOtp(email: string) {
    try {
      // Validate email format
      if (!isEmail(email)) {
        return { status: 400, message: 'Invalid email format' };
      }

      const user = await this.userService.findOneUserByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists or not
        return {
          status: 200,
          message:
            'If the email exists in our system, you will receive an OTP shortly',
        };
      }

      if (!user.isActive) {
        return { status: 400, message: 'Account is inactive' };
      }

      // Check if previous OTP is still valid (prevent spam)
      const currentTimestamp = new Date().getTime();
      if (user.otpExpiredAt && currentTimestamp < user.otpExpiredAt) {
        const remainingTimeInMinutes = Math.ceil(
          (user.otpExpiredAt - currentTimestamp) / (60 * 1000),
        );
        return {
          status: 400,
          message: `Previous OTP is still valid. Please wait ${remainingTimeInMinutes} minute(s) before requesting a new one.`,
        };
      }

      // Generate new OTP
      const otp = randomNumGenerate.generateOTP();

      // Set OTP expiration time (5 minutes from now)
      const expirationTime = currentTimestamp + 5 * 60 * 1000; // 5 minutes in milliseconds

      // Update user with new OTP and expiration
      user.intOtp = otp;
      user.otpExpiredAt = expirationTime;
      await this.userRepository.save(user);

      // Send email
      const mailBody = otpEmailBody(otp);
      const emailResult = await sendMail(
        email,
        'MABI New Password Reset OTP',
        mailBody,
      );

      if (!emailResult.success) {
        console.error('Failed to send OTP email:', emailResult.message);
        // Clear the OTP since email failed
        user.intOtp = null;
        user.otpExpiredAt = null;
        await this.userRepository.save(user);

        return {
          status: 500,
          message: 'Failed to send email. Please try again later.',
        };
      }

      console.log(`New OTP sent successfully to ${email}`);
      return {
        status: 200,
        message: 'New OTP sent successfully to your email',
      };
    } catch (error) {
      console.error('Regenerate OTP error:', error);
      return {
        status: 500,
        message: 'Internal server error. Please try again later.',
        error: error.message,
      };
    }
  }
}