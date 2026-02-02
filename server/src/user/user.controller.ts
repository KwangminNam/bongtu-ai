import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /** NextAuth JWT callback에서 호출 — 소셜 로그인 시 유저 findOrCreate */
  @Post('sync')
  async sync(@Body() body: { email: string; name?: string; image?: string }) {
    return this.userService.findOrCreate(body.email, body.name, body.image);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id);
  }
}
