import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret: process.env.JWT_SECRET });
      const user = await this.prisma.user.findFirst({ where: { id: payload.sub, isActive: true, deletedAt: null } });
      if (!user) throw new UnauthorizedException('Account is inactive');
      request.user = { id: user.id, email: user.email, role: user.role, isFirstLogin: user.isFirstLogin } satisfies AuthUser;
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired token'); }
  }
}
