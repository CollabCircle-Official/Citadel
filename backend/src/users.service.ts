import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private select = { id: true, email: true, role: true, isActive: true, isFirstLogin: true, fullName: true, employeeId: true, department: true, team: true, jobTitle: true, employmentType: true, joiningDate: true, dateOfBirth: true, gender: true, personalEmail: true, phone: true, address: true, emergencyName: true, emergencyPhone: true, lastLoginAt: true, createdAt: true } as const;

  list() { return this.prisma.user.findMany({ where: { deletedAt: null }, select: this.select, orderBy: { fullName: 'asc' } }); }
  async me(id: string) { return this.prisma.user.findUniqueOrThrow({ where: { id }, select: this.select }); }
  async create(dto: any, actorRole: string) {
    const email = dto.email.toLowerCase();
    if (actorRole === 'HR_MANAGER' && (dto.role ?? 'EMPLOYEE') !== 'EMPLOYEE') throw new ForbiddenException('HR Manager can only create employee accounts');
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && !existing.deletedAt) throw new ConflictException('Email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({ data: { ...this.profile(dto), fullName: dto.fullName, email, passwordHash, role: dto.role ?? 'EMPLOYEE', isFirstLogin: true }, select: this.select });
  }
  async update(id: string, dto: any, actorRole: string) { const target = await this.exists(id); this.assertTarget(actorRole, target.role); if (actorRole === 'HR_MANAGER' && dto.role && dto.role !== 'EMPLOYEE') throw new ForbiddenException('HR Manager can only assign the Employee role'); return this.prisma.user.update({ where: { id }, data: { ...this.profile(dto), ...(dto.email ? { email: dto.email.toLowerCase() } : {}), ...(dto.role ? { role: dto.role } : {}) }, select: this.select }); }
  async updateOwn(id: string, dto: any) { await this.exists(id); const allowed = ['fullName','personalEmail','phone','address','emergencyName','emergencyPhone']; const data = Object.fromEntries(Object.entries(dto).filter(([key]) => allowed.includes(key))); return this.prisma.user.update({ where: { id }, data, select: this.select }); }
  async setActive(id: string, active: boolean, actorRole: string) { const target = await this.exists(id); this.assertTarget(actorRole, target.role); return this.prisma.user.update({ where: { id }, data: { isActive: active }, select: this.select }); }
  async softDelete(id: string, actorRole: string) { const target = await this.exists(id); this.assertTarget(actorRole, target.role); return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false }, select: this.select }); }
  async resetPassword(id: string, password: string, actorRole: string) { const target = await this.exists(id); this.assertTarget(actorRole, target.role); return this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12), isFirstLogin: true }, select: this.select }); }
  private async exists(id: string) { const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } }); if (!user) throw new NotFoundException('Employee not found'); return user; }
  private assertTarget(actorRole: string, targetRole: string) { if (actorRole === 'HR_MANAGER' && targetRole !== 'EMPLOYEE') throw new ForbiddenException('HR Manager can only manage employee accounts'); }
  private profile(dto: any) { const fields = ['fullName','employeeId','department','team','jobTitle','employmentType','joiningDate','dateOfBirth','gender','personalEmail','phone','address','emergencyName','emergencyPhone']; return Object.fromEntries(Object.entries(dto).filter(([key, value]) => fields.includes(key) && value !== undefined)); }
}
