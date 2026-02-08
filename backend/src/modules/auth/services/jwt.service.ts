import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginInfo } from '../entities/login-info.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class JwtService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LoginInfo)
    private readonly loginInfoRepository: Repository<LoginInfo>,
    private readonly jwt: Jwt,
  ) {}

  // Decoding the JWT Token
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token); // No options object needed
  }

  // Get User by User ID we get from decode()
  public async validateUser(decoded: any) {
    const user = await this.userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      // IF USER NOT FOUND
      return null; // Explicitly return null
    }
    return {
      id: user.id,
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isEmailVerified: user.isEmailVerified,
    };
  }

  // Generate JWT Token
  public generateToken(auth: User): string {
    return this.jwt.sign({ id: auth.id, email: auth.email });
  }

  // Validate User's password
  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  // Encode User's password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  // Validate JWT Token with proper secret
  public async verify(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ): Promise<any> {
    try {
      const secret =
        tokenType === 'access'
          ? process.env.JWT_ACCESS_SECRET
          : process.env.JWT_REFRESH_SECRET;

      return this.jwt.verify(token, { secret });
    } catch (err) {
      throw err;
    }
  }

  // Add helper method to verify access tokens specifically
  public async verifyAccessToken(token: string): Promise<any> {
    return this.verify(token, 'access');
  }

  // Add helper method to verify refresh tokens specifically
  public async verifyRefreshToken(token: string): Promise<any> {
    return this.verify(token, 'refresh');
  }

  // Validate refresh token specifically
  public async validateRefreshToken(token: string): Promise<any> {
    try {
      const decoded = await this.verifyRefreshToken(token);

      // Check if it's actually a refresh token
      if (!decoded || decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (err) {
      throw err;
    }
  }

  // Check if token is valid in the database
  public async isTokenActive(
    token: string,
    tokenType: 'access' | 'refresh',
  ): Promise<boolean> {
    const columnName =
      tokenType === 'access' ? 'access_token' : 'refresh_token';
    const loginInfo = await this.loginInfoRepository.findOne({
      where: { [columnName]: token },
    });

    return !!loginInfo; // Return true if token exists in database
  }

  // Validate User's token
  public async validateToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ): Promise<any> {
    try {
      // First verify the token's signature and expiration
      const decoded = await this.verify(token, tokenType);

      // Then check if the token is still active in the database
      const isActive = await this.isTokenActive(token, tokenType);
      if (!isActive) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      return decoded;
    } catch (error) {
      throw error;
    }
  }
}
