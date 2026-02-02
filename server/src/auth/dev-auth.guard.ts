import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * 개발용 임시 가드 — JWT 없이 테스트 유저로 요청 처리
 * TODO: 로그인 구현 후 JwtAuthGuard로 되돌릴 것
 */
@Injectable()
export class DevAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<
        Request & { user?: { id: string; email: string; name: string | null } }
      >();

    // 테스트 유저 findOrCreate
    const user = await this.prisma.user.upsert({
      where: { email: 'test@test.com' },
      update: {},
      create: { email: 'test@test.com', name: '테스트유저' },
    });

    request.user = { id: user.id, email: user.email, name: user.name };
    return true;
  }
}
