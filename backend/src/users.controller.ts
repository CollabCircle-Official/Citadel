import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

class CreateUserDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; @IsString() fullName!: string; @IsOptional() role?: Role; [key: string]: any; }
class PasswordDto { @IsString() @MinLength(8) password!: string; }

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@Req() req: any) { return this.users.me(req.user.id); }
  @Patch('me') updateMe(@Req() req: any, @Body() dto: any) { return this.users.updateOwn(req.user.id, dto); }
  @Get() @Roles(Role.ADMIN, Role.HR_MANAGER) list() { return this.users.list(); }
  @Post() @Roles(Role.ADMIN, Role.HR_MANAGER) create(@Req() req: any, @Body() dto: CreateUserDto) { return this.users.create(dto, req.user.role); }
  @Patch(':id') @Roles(Role.ADMIN, Role.HR_MANAGER) update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.users.update(id, dto, req.user.role); }
  @Post(':id/activate') @Roles(Role.ADMIN, Role.HR_MANAGER) activate(@Req() req: any, @Param('id') id: string) { return this.users.setActive(id, true, req.user.role); }
  @Post(':id/deactivate') @Roles(Role.ADMIN, Role.HR_MANAGER) deactivate(@Req() req: any, @Param('id') id: string) { return this.users.setActive(id, false, req.user.role); }
  @Post(':id/reset-password') @Roles(Role.ADMIN, Role.HR_MANAGER) resetPassword(@Req() req: any, @Param('id') id: string, @Body() dto: PasswordDto) { return this.users.resetPassword(id, dto.password, req.user.role); }
  @Delete(':id') @Roles(Role.ADMIN, Role.HR_MANAGER) delete(@Req() req: any, @Param('id') id: string) { return this.users.softDelete(id, req.user.role); }
}
