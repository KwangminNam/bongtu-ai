import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findOrCreate(email: string, name?: string, image?: string) {
    return this.prisma.user.upsert({
      where: { email },
      update: { name, image },
      create: { email, name, image },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
