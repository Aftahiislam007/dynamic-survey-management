import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get('JWT_ACCESS_SECRET'),
      signOptions: {
        expiresIn: configService.get<number>('JWT_ACCESS_EXPIRATION'),
      },
    };
  },
  inject: [ConfigService],
};
