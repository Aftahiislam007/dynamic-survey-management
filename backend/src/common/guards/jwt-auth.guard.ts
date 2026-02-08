import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.DISABLE_AUTH === 'true') {
      this.logger.warn(
        'DISABLE_AUTH is enabled — bypassing JWT auth for all requests',
      );
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();
      if (!req.user)
        req.user = {
          id: 'dev-bypass',
          roles: ['admin'],
          userType: 'superadmin',
        };
      return true;
    }

    return super.canActivate(context);
  }
}
  