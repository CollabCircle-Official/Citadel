import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const accessToken = await this.jwt.signAsync({ sub: user.id }, { secret: process.env.JWT_SECRET, expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as any });
    return { accessToken, user: this.safeUser(user) };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(newPassword, 12), isFirstLogin: false } });
    return { message: 'Password changed successfully' };
  }

  safeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
