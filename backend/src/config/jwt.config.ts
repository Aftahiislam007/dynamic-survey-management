import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export const jwtConfig: JwtModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') as StringValue,
    },
  }),
  inject: [ConfigService],
};
