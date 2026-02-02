import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface AuthRequest {
  user: { id: string; email: string; name: string | null };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
