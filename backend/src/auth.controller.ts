import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }
class ChangePasswordDto { @IsString() @MinLength(8) currentPassword!: string; @IsString() @MinLength(8) newPassword!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
  @Post('logout') @UseGuards(AuthGuard) logout() { return { message: 'Logged out successfully' }; }
  @Post('change-password') @UseGuards(AuthGuard) changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) { return this.auth.changePassword(req.user.id, dto.currentPassword, dto.newPassword); }
}
