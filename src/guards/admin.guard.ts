import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // using request.user from JWT guard

    if (!user) {
      throw new ForbiddenException('No user logged in');
    }

    if (!user.admin) {  // matching User entity property
      throw new ForbiddenException('Only admins can perform this action');
    }

    return true;
  }
}
