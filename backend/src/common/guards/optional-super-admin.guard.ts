import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class OptionalSuperAdminGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OptionalSuperAdminGuard.name);

  constructor(private usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if auth is disabled (for development)
    if (process.env.DISABLE_AUTH === 'true') {
      this.logger.warn('DISABLE_AUTH is enabled — bypassing auth for admin registration');
      request.user = {
        id: 'dev-bypass',
        isSuperAdmin: true,
        userType: 'superadmin',
      };
      return true;
    }

    // Check if any super admin exists in the system
    const superAdminExists = await this.usersService.checkSuperAdminExists();

    // If no super admin exists, allow registration without authentication (first admin)
    if (!superAdminExists) {
      this.logger.log('No super admin exists - allowing first admin registration');
      request.isFirstAdmin = true;
      return true;
    }

    // If super admin exists, require JWT authentication
    this.logger.log('Super admin exists - requiring authentication');
    
    try {
      // Call parent canActivate to perform JWT validation
      const result = await super.canActivate(context);
      
      if (!result) {
        throw new UnauthorizedException('Authentication failed');
      }

      // Get the authenticated user from request
      const user = request.user;

      // Verify user is a super admin
      if (!user || !user.isSuperAdmin) {
        this.logger.warn(`User ${user?.id} attempted to create admin but is not super admin`);
        throw new UnauthorizedException('Only super admin can create admin users');
      }

      this.logger.log(`Super admin ${user.id} creating new admin user`);
      return true;
      
    } catch (error) {
      this.logger.error('Authentication error:', error.message);
      throw new UnauthorizedException(
        error.message || 'Authentication required to create admin users'
      );
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // If this is the first admin registration or auth is disabled, skip user requirement
    if (request.isFirstAdmin || process.env.DISABLE_AUTH === 'true') {
      return request.user || null;
    }

    // Otherwise, require valid authenticated user
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }

    return user;
  }
}