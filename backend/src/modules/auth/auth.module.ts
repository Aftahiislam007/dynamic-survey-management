import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginInfo } from './entities/login-info.entity';
import { User } from '../users/entities/user.entity';
import { UserPasswordSecurityManager } from '../users/entities/user-password-security-manager.entity';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OptionalSuperAdminGuard } from 'src/common/guards/optional-super-admin.guard';
import { JwtService } from './services/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginInfo, User, UserPasswordSecurityManager]),
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalSuperAdminGuard,
  ],
  exports: [AuthService, JwtService, JwtAuthGuard, OptionalSuperAdminGuard],
})
export class AuthModule {}