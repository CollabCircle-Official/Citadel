import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

const ZONE = 'Asia/Dhaka';
const WORKING_DAYS = new Set(['Sat', 'Mon', 'Tue', 'Wed', 'Thu']);

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private localParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(date);
    return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  }
  private localDate(date = new Date()) { const p = this.localParts(date); return `${p.year}-${p.month}-${p.day}`; }
  private dateValue(date = new Date()) { return new Date(`${this.localDate(date)}T00:00:00.000Z`); }
  private ensureWorkingDay() { if (!WORKING_DAYS.has(this.localParts().weekday)) throw new BadRequestException('Attendance is available only on working days'); }
  private status(now = new Date()): AttendanceStatus { return Number(this.localParts(now).hour) >= 11 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT; }

  async checkIn(userId: string) {
    this.ensureWorkingDay();
    await this.reconcileForgottenCheckouts();
    const date = this.dateValue();
    const existing = await this.prisma.attendance.findUnique({ where: { userId_date: { userId, date } } });
    if (existing) throw new BadRequestException('You have already checked in today');
    return this.prisma.attendance.create({ data: { userId, date, checkIn: new Date(), status: this.status(), isLate: this.status() === AttendanceStatus.LATE } });
  }

  async checkOut(userId: string) {
    this.ensureWorkingDay();
    const date = this.dateValue();
    const attendance = await this.prisma.attendance.findUnique({ where: { userId_date: { userId, date } } });
    if (!attendance) throw new BadRequestException('Check in before checking out');
    if (attendance.checkOut) throw new BadRequestException('You have already checked out today');
    return this.prisma.attendance.update({ where: { id: attendance.id }, data: { checkOut: new Date(), status: attendance.isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT } });
  }

  mine(userId: string) { return this.prisma.attendance.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 90 }); }
  all() { return this.prisma.attendance.findMany({ where: { user: { deletedAt: null } }, include: { user: { select: { id: true, fullName: true, email: true, department: true, team: true, role: true } } }, orderBy: [{ date: 'desc' }, { checkIn: 'desc' }] }); }
  async update(id: string, dto: any) { const data: Prisma.AttendanceUpdateInput = {}; if (dto.checkIn) data.checkIn = new Date(dto.checkIn); if (dto.checkOut) data.checkOut = new Date(dto.checkOut); if (dto.status) data.status = dto.status; if (typeof dto.isLate === 'boolean') data.isLate = dto.isLate; if (dto.notes !== undefined) data.notes = dto.notes; return this.prisma.attendance.update({ where: { id }, data }); }
  async createForUser(userId: string, dto: any) { const date = new Date(`${dto.date}T00:00:00.000Z`); if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date'); return this.prisma.attendance.create({ data: { userId, date, checkIn: new Date(dto.checkIn), checkOut: dto.checkOut ? new Date(dto.checkOut) : null, status: dto.status ?? AttendanceStatus.PRESENT, isLate: dto.isLate ?? false, notes: dto.notes } }); }
  async remove(id: string) { await this.prisma.attendance.delete({ where: { id } }); return { message: 'Attendance record deleted' }; }

  @Cron('5 0 * * *', { timeZone: ZONE })
  async reconcileForgottenCheckouts() {
    const today = this.dateValue();
    const incomplete = await this.prisma.attendance.findMany({ where: { date: { lt: today }, checkOut: null, user: { isActive: true, deletedAt: null } } });
    for (const record of incomplete) {
      await this.prisma.$transaction([
        this.prisma.attendance.update({ where: { id: record.id }, data: { status: AttendanceStatus.INCOMPLETE, notes: 'Automatically marked incomplete: check-out was missed.' } }),
        this.prisma.user.update({ where: { id: record.userId }, data: { isActive: false } }),
      ]);
    }
    return incomplete.length;
  }

  async ensureOwner(userId: string, recordId: string) { const record = await this.prisma.attendance.findUnique({ where: { id: recordId } }); if (!record) throw new NotFoundException('Attendance not found'); if (record.userId !== userId) throw new ForbiddenException(); return record; }
}
