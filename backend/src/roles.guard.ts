import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user;
    if (!roles.includes(user?.role)) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
