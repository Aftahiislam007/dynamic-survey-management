import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    try {
      // Extract token from authorization header
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }
      // Check if token is still valid in the database
      //   const isActive = await this.jwtService.isTokenActive(token, "access");
      //   if (!isActive) {
      //     throw new UnauthorizedException("Access token has been invalidated");
      //   }

      // Now validate the user
      return this.jwtService.validateUser(payload);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
