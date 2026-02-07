import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get the required permissions from the route's metadata
    const allowedUserTypes = this.reflector.get<string>(
      'allowedUserTypes',
      context.getHandler(),
    );

    // If no restrictions specified, allow access
    if (!allowedUserTypes || allowedUserTypes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Make sure user exists and has a userType
    if (!request.user || !request.user.userType) {
      throw new ForbiddenException(
        'User not authenticated or missing user type',
      );
    }

    // Check if user's type is in the allowed types
    const hasPermission = allowedUserTypes.includes(request.user.userType);

    if (!hasPermission) {
      throw new ForbiddenException(
        `User type ${request.user.userType} not authorized for this resource`,
      );
    }

    return true;
  }
}
