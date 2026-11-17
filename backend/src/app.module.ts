import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot(), JwtModule.register({})],
  controllers: [AuthController, UsersController, AttendanceController],
  providers: [PrismaService, AuthService, UsersService, AttendanceService, AuthGuard, RolesGuard],
})
export class AppModule {}
