import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Observable } from "rxjs";

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.currentUser; // ✅ this must exist

    if (!user) {
      throw new ForbiddenException('No user logged in');
    }

    if (!user.isAdmin) {  // 👈 check your admin property
      throw new ForbiddenException('Only admins can perform this action');
    }

    return true; // allow access
  }
}