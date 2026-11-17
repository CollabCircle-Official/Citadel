import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}
  @Post('check-in') checkIn(@Req() req: any) { return this.attendance.checkIn(req.user.id); }
  @Post('check-out') checkOut(@Req() req: any) { return this.attendance.checkOut(req.user.id); }
  @Get('me') mine(@Req() req: any) { return this.attendance.mine(req.user.id); }
  @Get() @Roles(Role.ADMIN, Role.HR_MANAGER) all() { return this.attendance.all(); }
  @Post('employee/:userId') @Roles(Role.ADMIN, Role.HR_MANAGER) create(@Param('userId') userId: string, @Body() dto: any) { return this.attendance.createForUser(userId, dto); }
  @Patch(':id') @Roles(Role.ADMIN, Role.HR_MANAGER) update(@Param('id') id: string, @Body() dto: any) { return this.attendance.update(id, dto); }
  @Delete(':id') @Roles(Role.ADMIN, Role.HR_MANAGER) remove(@Param('id') id: string) { return this.attendance.remove(id); }
}
